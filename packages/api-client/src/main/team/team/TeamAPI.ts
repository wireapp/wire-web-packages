//
// Wire
// Copyright (C) 2017 Wire Swiss GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see http://www.gnu.org/licenses/.
//

import {AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';

import {NewTeamData, TeamChunkData, TeamData} from '../';
import {HttpClient} from '../../http/';

export default class TeamAPI {
  constructor(private client: HttpClient) {}

  static get URL() {
    return {
      TEAMS: '/teams',
    };
  }

  public postTeam(team: NewTeamData): AxiosPromise {
    const config: AxiosRequestConfig = {
      data: team,
      method: 'post',
      url: `${TeamAPI.URL.TEAMS}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.headers['location']);
  }

  public putTeam(team: TeamData): AxiosPromise {
    const config: AxiosRequestConfig = {
      data: {
        name: team.name,
        icon: team.icon,
      },
      method: 'put',
      url: `${TeamAPI.URL.TEAMS}/${team.id}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public getTeams(): Promise<TeamChunkData> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${TeamAPI.URL.TEAMS}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public getTeam(teamId: string): Promise<TeamData> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${TeamAPI.URL.TEAMS}/${teamId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public deleteTeam(teamId: string, password: string): AxiosPromise {
    const config: AxiosRequestConfig = {
      data: {
        password,
      },
      method: 'delete',
      url: `${TeamAPI.URL.TEAMS}/${teamId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }
}
