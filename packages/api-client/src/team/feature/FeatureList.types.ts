/*
 * Wire
 * Copyright (C) 2020 Wire Swiss GmbH
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

import type {
  FeatureAppLock,
  FeatureAllowedGlobalOperations,
  FeatureChannels,
  FeatureClassifiedDomains,
  FeatureConferenceCalling,
  FeatureConsumableNotifications,
  FeatureDigitalSignature,
  FeatureDomainRegistration,
  FeatureDownloadPath,
  FeatureFileSharing,
  FeatureLegalhold,
  FeatureMLS,
  FeatureMLSE2EId,
  FeatureMLSMigration,
  FeatureSelfDeletingMessages,
  FeatureSndFactorPassword,
  FeatureVideoCalling,
  FeatureConversationGuestLink,
  FeatureCells,
} from './FeatureList.schema';

/**
 * FEATURE_KEY enum defines the canonical keys for all Wire feature flags.
 * These keys match the camelCase property names returned by the Wire backend API.
 */
export enum FEATURE_KEY {
  APPLOCK = 'appLock',
  ALLOWED_GLOBAL_OPERATIONS = 'allowedGlobalOperations',
  CLASSIFIED_DOMAINS = 'classifiedDomains',
  CONFERENCE_CALLING = 'conferenceCalling',
  CONSUMABLE_NOTIFICATIONS = 'consumableNotifications',
  CONVERSATION_GUEST_LINKS = 'conversationGuestLinks',
  DIGITAL_SIGNATURES = 'digitalSignatures',
  DOMAIN_REGISTRATION = 'domainRegistration',
  ENFORCE_DOWNLOAD_PATH = 'enforceFileDownloadLocation',
  FILE_SHARING = 'fileSharing',
  LEGALHOLD = 'legalhold',
  MLS = 'mls',
  MLSE2EID = 'mlsE2EId',
  MLS_MIGRATION = 'mlsMigration',
  SEARCH_VISIBILITY = 'searchVisibility',
  SELF_DELETING_MESSAGES = 'selfDeletingMessages',
  SND_FACTOR_PASSWORD = 'sndFactorPasswordChallenge',
  SSO = 'sso',
  VALIDATE_SAML_EMAILS = 'validateSAMLemails',
  VIDEO_CALLING = 'videoCalling',
  CHANNELS = 'channels',
  CELLS = 'cells',
}

export enum FeatureStatus {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
}

export enum FeatureLockStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
}

export enum AccessType {
  TEAM_MEMBERS = 'team-members',
  EVERYONE = 'everyone',
  ADMINS = 'admins',
}

export enum SelfDeletingTimeout {
  OFF = 0,
  SECONDS_10 = 10,
  MINUTES_5 = 300,
  HOURS_1 = 3_600,
  DAYS_1 = 86_400,
  WEEKS_1 = 604_800,
  WEEKS_4 = 2_419_200,
}

/**
 * FeatureList represents the response from the Wire backend feature flags API.
 *
 * IMPORTANT: This type uses types derived from Zod schemas in FeatureList.schema.ts.
 * The Zod schema is the single source of truth for structure and validation.
 *
 * When adding a new feature flag:
 * 1. Add the key to the FEATURE_KEY enum above
 * 2. Add the Zod schema in FeatureList.schema.ts
 * 3. Export the z.infer<> type from FeatureList.schema.ts
 * 4. Import and use it here
 */
export type FeatureList = {
  [FEATURE_KEY.APPLOCK]?: FeatureAppLock;
  [FEATURE_KEY.ALLOWED_GLOBAL_OPERATIONS]?: FeatureAllowedGlobalOperations;
  [FEATURE_KEY.CLASSIFIED_DOMAINS]?: FeatureClassifiedDomains;
  [FEATURE_KEY.CONFERENCE_CALLING]?: FeatureConferenceCalling;
  [FEATURE_KEY.DIGITAL_SIGNATURES]?: FeatureDigitalSignature;
  [FEATURE_KEY.DOMAIN_REGISTRATION]?: FeatureDomainRegistration;
  [FEATURE_KEY.CONSUMABLE_NOTIFICATIONS]?: FeatureConsumableNotifications;
  [FEATURE_KEY.ENFORCE_DOWNLOAD_PATH]?: FeatureDownloadPath;
  [FEATURE_KEY.CONVERSATION_GUEST_LINKS]?: FeatureConversationGuestLink;
  [FEATURE_KEY.FILE_SHARING]?: FeatureFileSharing;
  [FEATURE_KEY.LEGALHOLD]?: FeatureLegalhold;
  [FEATURE_KEY.SEARCH_VISIBILITY]?: FeatureDigitalSignature; // Uses FeatureWithoutConfig
  [FEATURE_KEY.SELF_DELETING_MESSAGES]?: FeatureSelfDeletingMessages;
  [FEATURE_KEY.SND_FACTOR_PASSWORD]?: FeatureSndFactorPassword;
  [FEATURE_KEY.SSO]?: FeatureDigitalSignature; // Uses FeatureWithoutConfig
  [FEATURE_KEY.MLS]?: FeatureMLS;
  [FEATURE_KEY.MLSE2EID]?: FeatureMLSE2EId;
  [FEATURE_KEY.MLS_MIGRATION]?: FeatureMLSMigration;
  [FEATURE_KEY.VALIDATE_SAML_EMAILS]?: FeatureDigitalSignature; // Uses FeatureWithoutConfig
  [FEATURE_KEY.VIDEO_CALLING]?: FeatureVideoCalling;
  [FEATURE_KEY.CHANNELS]?: FeatureChannels;
  [FEATURE_KEY.CELLS]?: FeatureCells;
  // Allow additional unknown features from newer API versions (matches Zod schema .passthrough())
  [key: string]: unknown;
};
