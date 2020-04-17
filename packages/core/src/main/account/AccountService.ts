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

import {APIClient} from '@wireapp/api-client';
import {Runtime} from '@wireapp/commons';
import {CallConfigData} from '@wireapp/api-client/dist/account/CallConfigData';
import {DomainData} from '@wireapp/api-client/dist/account/DomainData';
import {SSOSettings} from '@wireapp/api-client/dist/account/SSOSettings';

export class AccountService {
  constructor(private readonly apiClient: APIClient) {}

  public getCallConfig(): Promise<CallConfigData> {
    const iceCandidateLimit = Runtime.isFirefox() ? 3 : undefined;
    return this.apiClient.account.api.getCallConfig(iceCandidateLimit);
  }

  public postDeleteAccount(key: string, code: string): Promise<void> {
    return this.apiClient.account.api.postDeleteAccount(key, code);
  }

  public postPasswordReset(email: string): Promise<void> {
    return this.apiClient.account.api.postPasswordReset(email);
  }

  public postPasswordResetComplete(password: string, key: string, code: string): Promise<void> {
    return this.apiClient.account.api.postPasswordResetComplete(password, key, code);
  }

  public postBotPasswordResetComplete(password: string, key: string, code: string): Promise<void> {
    return this.apiClient.account.api.postBotPasswordResetComplete(password, key, code);
  }

  public getVerifyEmail(key: string, code: string): Promise<void> {
    return this.apiClient.account.api.getVerifyEmail(key, code);
  }

  public getVerifyBot(key: string, code: string): Promise<void> {
    return this.apiClient.account.api.getVerifyBot(key, code);
  }

  public getDomain(domain: string): Promise<DomainData> {
    return this.apiClient.account.api.getDomain(domain);
  }

  public getSSOSettings(): Promise<SSOSettings> {
    return this.apiClient.account.api.getSSOSettings();
  }
}
