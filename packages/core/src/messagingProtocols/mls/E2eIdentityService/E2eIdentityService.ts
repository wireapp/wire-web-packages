/*
 * Wire
 * Copyright (C) 2023 Wire Swiss GmbH
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

import {AcmeDirectory, CoreCrypto, WireE2eIdentity} from '@wireapp/core-crypto/platforms/web/corecrypto';
import logdown from 'logdown';

import {AcmeConnectionService} from './Connection';

export class E2eIdentityService {
  private readonly logger = logdown('@wireapp/core/E2EIdentityService');
  private readonly ConnectionService: AcmeConnectionService = new AcmeConnectionService();
  private Identity: WireE2eIdentity | undefined;

  private directory: AcmeDirectory | undefined;
  private initialNonce: string | undefined;

  constructor(private readonly coreCryptoClient: CoreCrypto) {}

  private async getDirectory(): Promise<void> {
    const directory = await this.ConnectionService.getDirectory();

    if (directory) {
      const parsedDirectory = this.Identity?.directoryResponse(directory);
      this.directory = parsedDirectory;
    }
  }

  private async getInitialNonce(): Promise<void> {
    if (this.directory?.newNonce) {
      const initialNonce = await this.ConnectionService.getInitialNonce(this.directory.newNonce);

      if (initialNonce) {
        this.initialNonce = initialNonce;
      }
    }
  }

  private async createNewAccount(): Promise<void> {
    if (this.Identity && this.directory?.newAccount && !!this.initialNonce?.length) {
      const reqBody = this.Identity.newAccountRequest(this.directory, this.initialNonce);
      const accountResponse = await this.ConnectionService.createNewAccount(this.directory.newAccount, reqBody);

      if (accountResponse) {
        const parsedAccountResponse = this.Identity.newAccountResponse(accountResponse);
        this.Identity.console.log(parsedAccountResponse);
      }
    }
  }

  public async getNewCertificate(): Promise<void> {
    // If no Identity is found, create a new one
    if (!this.Identity) {
      this.logger.info('No Identity found, creating new E2E Identity');
      this.Identity = await this.coreCryptoClient.newAcmeEnrollment();
    }
    // If no directory is found, get the directory
    if (!this.directory) {
      await this.getDirectory();
    }

    // Step 1: Get a new nonce
    await this.getInitialNonce();

    // Step 2: Create a new account
    await this.createNewAccount();

    console.info('adrian', this.directory, this.initialNonce);
  }
}
