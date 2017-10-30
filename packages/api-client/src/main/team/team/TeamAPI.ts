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
