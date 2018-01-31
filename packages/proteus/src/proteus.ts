/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
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

/* eslint sort-keys: "off" */

import ArrayUtil from "./proteus/util/ArrayUtil"
import CipherMessage from './proteus/message/CipherMessage';
import DecodeError from './proteus/errors/DecodeError';
import DecryptError from './proteus/errors/DecryptError';
import Envelope from './proteus/message/Envelope';
import IdentityKey from './proteus/keys/IdentityKey';
import IdentityKeyPair from './proteus/keys/IdentityKeyPair';
import InputError from './proteus/errors/InputError';
import KeyDerivationUtil from "./proteus/util/KeyDerivationUtil"
import KeyPair from './proteus/keys/KeyPair';
import MemoryUtil from "./proteus/util/MemoryUtil"
import Message from './proteus/message/Message';
import PreKey from './proteus/keys/PreKey';
import PreKeyAuth from './proteus/keys/PreKeyAuth';
import PreKeyBundle from './proteus/keys/PreKeyBundle';
import PreKeyMessage from './proteus/message/PreKeyMessage';
import PreKeyStore from './proteus/session/PreKeyStore';
import ProteusError from './proteus/errors/ProteusError';
import PublicKey from './proteus/keys/PublicKey';
import SecretKey from './proteus/keys/SecretKey';
import Session from './proteus/session/Session';
import SessionTag from './proteus/message/SessionTag';
import TypeUtil from "./proteus/util/TypeUtil"

export = {
  errors: {
    ProteusError,
    DecodeError,
    DecryptError,
    InputError,
  },

  keys: {
    IdentityKey,
    IdentityKeyPair,
    KeyPair,
    PreKeyAuth,
    PreKeyBundle,
    PreKey,
    PublicKey,
    SecretKey,
  },

  message: {
    Message,
    CipherMessage,
    PreKeyMessage,
    Envelope,
    SessionTag,
  },

  session: {
    PreKeyStore,
    Session,
  },

  util: {
    ArrayUtil,
    KeyDerivationUtil,
    MemoryUtil,
    TypeUtil,
  }
};
