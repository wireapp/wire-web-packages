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

import {message as ProteusMessage, session as ProteusSession} from '@wireapp/proteus';
import DecryptionError from './DecryptionError';
import {CryptoboxCRUDStore} from './store/root';

class CryptoboxSession {
  public id: string;
  public pk_store: CryptoboxCRUDStore;
  public session: ProteusSession.Session;

  constructor(id: string | undefined, pk_store: CryptoboxCRUDStore, session: ProteusSession.Session) {
    this.pk_store = pk_store;
    this.session = session;
    this.id = id || this.generateSessionId();
    Object.freeze(this);
  }

  public decrypt(ciphertext: ArrayBuffer): Promise<Uint8Array> {
    if (ciphertext.byteLength === 0) {
      return Promise.reject(new DecryptionError('Cannot decrypt an empty ArrayBuffer.'));
    }

    const envelope: ProteusMessage.Envelope = ProteusMessage.Envelope.deserialise(ciphertext);
    return this.session.decrypt(this.pk_store, envelope);
  }

  public encrypt(plaintext: string | Uint8Array): Promise<ArrayBuffer> {
    return this.session.encrypt(plaintext).then(function(ciphertext: ProteusMessage.Envelope) {
      return ciphertext.serialise();
    });
  }

  public generateSessionId(): string {
    const from = this.fingerprint_local();
    const to = this.fingerprint_remote();
    return `${from}@${to}`;
  }

  public fingerprint_local(): string {
    return this.session.local_identity!.public_key.fingerprint();
  }

  public fingerprint_remote(): string {
    return this.session.remote_identity!.fingerprint();
  }
}

export default CryptoboxSession;
