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
import ProteusError from './proteus/errors/ProteusError';
import DecodeError from './proteus/errors/DecodeError';
import DecryptError from './proteus/errors/DecryptError';
import InputError from './proteus/errors/InputError';
import IdentityKey from './proteus/keys/IdentityKey';
import IdentityKeyPair from './proteus/keys/IdentityKeyPair';
import KeyPair from './proteus/keys/KeyPair';
import PreKeyAuth from './proteus/keys/PreKeyAuth';
import PreKeyBundle from './proteus/keys/PreKeyBundle';
import PreKey from './proteus/keys/PreKey';
import PublicKey from './proteus/keys/PublicKey';
import SecretKey from './proteus/keys/SecretKey';
import Message from './proteus/message/Message';
import CipherMessage from './proteus/message/CipherMessage';
import PreKeyMessage from './proteus/message/PreKeyMessage';
import Envelope from './proteus/message/Envelope';
import PreKeyStore from './proteus/session/PreKeyStore';
import Session from './proteus/session/Session';

export default {
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
  },

  session: {
    PreKeyStore,
    Session,
  },
};
