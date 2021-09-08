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

import type {APIClient} from '@wireapp/api-client';
import type {Self} from '@wireapp/api-client/src/self/';

export class SelfService {
  constructor(private readonly apiClient: APIClient) {}

  public async checkUsername(username: string): Promise<boolean> {
    const [availableUsername] = await this.checkUsernames([username]);
    return !!availableUsername;
  }

  public checkUsernames(usernames: string[]): Promise<string[]> {
    return this.apiClient.user.api.postHandles({
      handles: usernames,
    });
  }

  public async getName(): Promise<string> {
    const {name} = await this.apiClient.self.api.getName();
    return name;
  }

  public async getSelf(): Promise<Self> {
    const selfData = await this.apiClient.self.api.getSelf();
    return selfData;
  }

  public async getUsername(): Promise<string | undefined> {
    const {handle} = await this.getSelf();
    return handle;
  }

  public setName(name: string): Promise<void> {
    return this.apiClient.self.api.putSelf({name});
  }

  public setUsername(username: string): Promise<void> {
    return this.apiClient.self.api.putHandle({handle: username});
  }
}
