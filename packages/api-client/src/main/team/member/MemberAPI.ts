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

import {AxiosRequestConfig} from 'axios';

import {MemberData} from '../';
import {HttpClient} from '../../http';
import {TeamAPI} from '../team/TeamAPI';

class MemberAPI {
  constructor(private readonly client: HttpClient) {}

  static get URL() {
    return {
      MEMBERS: 'members',
    };
  }

  public getMembers(teamId: string): Promise<MemberData[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${TeamAPI.URL.TEAMS}/${teamId}/${MemberAPI.URL.MEMBERS}`,
    };

    return this.client.sendJSON<MemberData[]>(config).then(response => response.data);
  }

  public getMember(teamId: string, userId: string): Promise<void> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${TeamAPI.URL.TEAMS}/${teamId}/${MemberAPI.URL.MEMBERS}/${userId}`,
    };

    return this.client.sendJSON<void>(config).then(response => response.data);
  }

  public deleteMember(teamId: string, userId: string, password: string): Promise<void> {
    const config: AxiosRequestConfig = {
      data: {
        password,
      },
      method: 'delete',
      url: `${TeamAPI.URL.TEAMS}/${teamId}/${MemberAPI.URL.MEMBERS}/${userId}`,
    };

    return this.client.sendJSON<void>(config).then(response => response.data);
  }

  public postMembers(teamId: string, member: MemberData): Promise<void> {
    const config: AxiosRequestConfig = {
      data: {
        member: member,
      },
      method: 'post',
      url: `${TeamAPI.URL.TEAMS}/${teamId}/${MemberAPI.URL.MEMBERS}`,
    };

    return this.client.sendJSON<void>(config).then(response => response.data);
  }

  public putMembers(teamId: string, member: MemberData): Promise<void> {
    const config: AxiosRequestConfig = {
      data: {
        member: member,
      },
      method: 'put',
      url: `${TeamAPI.URL.TEAMS}/${teamId}/${MemberAPI.URL.MEMBERS}`,
    };

    return this.client.sendJSON<void>(config).then(response => response.data);
  }
}

export {MemberAPI};
