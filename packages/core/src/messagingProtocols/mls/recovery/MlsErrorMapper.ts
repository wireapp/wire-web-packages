/*
 * Wire
 * Copyright (C) 2025 Wire Swiss GmbH
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 *
 */

/**
 * A small, library-free Chain of Responsibility to normalize diverse MLS/core-crypto/backend
 * errors into a closed {@link DomainMlsError} union. This module is side-effect free and only
 * classifies errors; recovery actions are implemented by a separate orchestrator.
 */

import {SUBCONVERSATION_ID, MLSStaleMessageError, MLSGroupOutOfSyncError} from '@wireapp/api-client/lib/conversation';
import {QualifiedId} from '@wireapp/api-client/lib/user';
import {Encoder} from 'bazinga64';

import {isMlsConversationAlreadyExistsError, isMlsOrphanWelcomeError} from '@wireapp/core-crypto';

// Reuse existing type-guards from the MLS layer
import {
  isCoreCryptoMLSWrongEpochError,
  isMLSStaleMessageError,
  isMLSGroupOutOfSyncError,
  isBrokenMLSConversationError,
  getMLSGroupOutOfSyncErrorMissingUsers,
} from '../MLSService/CoreCryptoMLSError';

/**
 * Domain error taxonomy used by policies and orchestrator.
 *
 * These are intentionally decoupled from concrete error classes to keep the orchestrator stable.
 */
export type DomainMlsErrorType =
  | 'WrongEpoch'
  | 'ConversationAlreadyExists'
  | 'OrphanWelcome'
  | 'KeyMaterialUpdateFailure'
  | 'GroupOutOfSync'
  | 'GroupNotEstablished'
  | 'Unknown';

/**
 * Normalized error shape produced by the mapper.
 */
export type DomainMlsError = {
  /** The domain classification. */
  type: DomainMlsErrorType;
  /** Optional human-friendly message for logging only. */
  message?: string;
  /** The original error value, preserved for debugging. */
  cause?: unknown;
  /** Lightweight, structured context to inform recovery. */
  context?: {
    /** Conversation qualified id if known. */
    qualifiedConversationId?: QualifiedId;
    /** MLS group id (base64) if available. */
    groupId?: string;
    /** Expected/observed epoch number if relevant. */
    epoch?: number | bigint;
    /** Users reported as missing by the backend or MLS layer. */
    missingUsers?: QualifiedId[];
    /** Subconversation context (e.g. conference). */
    subconvId?: SUBCONVERSATION_ID;
    /** HTTP status when the source error came from the backend. */
    httpStatus?: number;
  };
};

/**
 * Optional context supplied by the caller to improve mapping precision.
 */
export type ErrorContextInput = {
  qualifiedConversationId?: QualifiedId;
  groupId?: string;
  subconvId?: SUBCONVERSATION_ID;
};

/** One handler in the chain. Must be side-effect free. */
export interface ErrorHandler {
  /** True if this handler can map the provided error given optional context. */
  canHandle(error: unknown, context?: ErrorContextInput): boolean;
  /** Return a mapped error or undefined to defer to later handlers. */
  map(error: unknown, context?: ErrorContextInput): DomainMlsError | undefined;
  /** Lower runs earlier (higher precedence). */
  priority?: number;
}

/** Public mapper interface returning a normalized {@link DomainMlsError}. */
export interface MlsErrorMapper {
  map(error: unknown, context?: ErrorContextInput): DomainMlsError;
}

/**
 * Deterministic chain execution with priority ordering.
 *
 * Handlers are sorted ascending by {@link ErrorHandler.priority}. The first handler that both
 * canHandle and returns a non-undefined mapping wins. If none map, an Unknown error is returned.
 */
export class ChainedMlsErrorMapper implements MlsErrorMapper {
  private readonly handlers: ErrorHandler[];

  constructor(handlers: ErrorHandler[]) {
    this.handlers = handlers.slice().sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
  }

  map(error: unknown, context?: ErrorContextInput): DomainMlsError {
    for (const handler of this.handlers) {
      if (handler.canHandle(error, context)) {
        const mapped = handler.map(error, context);
        if (mapped) {
          return mapped;
        }
      }
    }
    return {type: 'Unknown', message: (error as any)?.message, cause: error, context: context};
  }
}

/** ---------------------- Concrete handlers ---------------------- */

/** Wrong epoch or stale message from MLS/core-crypto/backend. */
const WrongEpochHandler: ErrorHandler = {
  priority: 10,
  canHandle: err =>
    isCoreCryptoMLSWrongEpochError?.(err) || isMLSStaleMessageError?.(err) || err instanceof MLSStaleMessageError,
  map: (err, context) => ({
    type: 'WrongEpoch',
    message: 'Epoch mismatch or stale message',
    cause: err,
    context: {
      qualifiedConversationId: context?.qualifiedConversationId,
      groupId: context?.groupId,
      subconvId: context?.subconvId,
    },
  }),
};

/** Local MLS state indicates the conversation is broken/not established. */
const BrokenConversationHandler: ErrorHandler = {
  priority: 15,
  canHandle: err => isBrokenMLSConversationError?.(err) === true,
  map: (err, context) => ({
    type: 'GroupNotEstablished',
    message: 'Broken MLS conversation',
    cause: err,
    context: {qualifiedConversationId: context?.qualifiedConversationId, groupId: context?.groupId},
  }),
};

/** Backend/MLS reports missing users; group is out-of-sync. */
const GroupOutOfSyncHandler: ErrorHandler = {
  priority: 20,
  canHandle: err => isMLSGroupOutOfSyncError?.(err) === true || err instanceof MLSGroupOutOfSyncError,
  map: (err, context) => {
    const missingUsers = isMLSGroupOutOfSyncError?.(err)
      ? getMLSGroupOutOfSyncErrorMissingUsers(err)
      : (err as any)?.missing_users ?? [];
    return {
      type: 'GroupOutOfSync',
      message: 'Group out of sync; missing users detected',
      cause: err,
      context: {qualifiedConversationId: context?.qualifiedConversationId, groupId: context?.groupId, missingUsers},
    };
  },
};

/** core-crypto indicates a local group already exists for the welcome's group id. */
const ConversationAlreadyExistsHandler: ErrorHandler = {
  priority: 30,
  canHandle: err => isMlsConversationAlreadyExistsError?.(err) === true,
  map: (err, context) => {
    const groupId = tryExtractGroupIdFromCoreCryptoError(err);
    return {
      type: 'ConversationAlreadyExists',
      message: 'Conversation already exists',
      cause: err,
      context: {groupId, qualifiedConversationId: context?.qualifiedConversationId},
    };
  },
};

/** Orphan welcome (no matching state); caller should try to join. */
const OrphanWelcomeHandler: ErrorHandler = {
  priority: 40,
  canHandle: err => isMlsOrphanWelcomeError?.(err) === true,
  map: (err, context) => ({
    type: 'OrphanWelcome',
    message: 'Orphan welcome message',
    cause: err,
    context: {qualifiedConversationId: context?.qualifiedConversationId},
  }),
};

/** Fallback classification when no handler matches. */
const FallbackHandler: ErrorHandler = {
  priority: 999,
  canHandle: () => true,
  map: (err, context) => ({type: 'Unknown', message: (err as any)?.message, cause: err, context: context}),
};

/**
 * Factory for the default mapper chain used by the orchestrator.
 *
 * Order matters: earlier handlers have higher precedence. The selection reflects
 * the most common recovery decisions needed by the orchestrator.
 */
export function createDefaultMlsErrorMapper(): MlsErrorMapper {
  return new ChainedMlsErrorMapper([
    WrongEpochHandler,
    BrokenConversationHandler,
    GroupOutOfSyncHandler,
    ConversationAlreadyExistsHandler,
    OrphanWelcomeHandler,
    FallbackHandler,
  ]);
}

/** ---------------------- helpers ---------------------- */

/**
 * Extract the base64 group id from a core-crypto error if present.
 *
 * core-crypto encodes the conversation id bytes under `error.context.context.conversationId`.
 * We convert the byte array to base64 for uniform handling in higher layers.
 */
function tryExtractGroupIdFromCoreCryptoError(err: unknown): string | undefined {
  try {
    // core-crypto error.context?.context?.conversationId is a byte array (number[])
    const conversationIdArray = (err as any)?.context?.context?.conversationId;
    if (!conversationIdArray) {
      return undefined;
    }
    return Encoder.toBase64(new Uint8Array(conversationIdArray)).asString;
  } catch (_) {
    return undefined;
  }
}

// Intentionally not handling HTTP/network errors here; let them bubble up unmodified.
