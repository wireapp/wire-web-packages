import {AxiosPromise, AxiosRequestConfig, AxiosResponse} from 'axios';

import {NewTeamInvitation, TeamInvitation, TeamInvitationChunk} from '../invitation';
import {HttpClient} from '../../http';
import {TeamAPI} from '../team';

export default class TeamInvitationAPI {
  constructor(private client: HttpClient) {}

  static get URL() {
    return {
      INFO: 'info',
      INVITATIONS: 'invitations',
    };
  }

  public getInvitation(teamId: string, invitationId: string): Promise<TeamInvitation> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${TeamAPI.URL.TEAMS}/${teamId}/${TeamInvitationAPI.URL.INVITATIONS}/${invitationId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public getInvitations(teamId: string): Promise<TeamInvitationChunk> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${TeamAPI.URL.TEAMS}/${teamId}/${TeamInvitationAPI.URL.INVITATIONS}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public deleteInvitation(teamId: string, invitationId: string): AxiosPromise {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: `${TeamAPI.URL.TEAMS}/${teamId}/${TeamInvitationAPI.URL.INVITATIONS}/${invitationId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public postInvitation(teamId: string, invitation: NewTeamInvitation): AxiosPromise {
    const config: AxiosRequestConfig = {
      data: invitation,
      method: 'post',
      url: `${TeamAPI.URL.TEAMS}/${teamId}/${TeamInvitationAPI.URL.INVITATIONS}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  public getInvitationFromCode(invitationCode: string): Promise<TeamInvitation> {
    const config: AxiosRequestConfig = {
      params: {
        code: invitationCode,
      },
      method: 'get',
      url: `${TeamAPI.URL.TEAMS}/${TeamInvitationAPI.URL.INVITATIONS}/${TeamInvitationAPI.URL.INFO}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }
}
