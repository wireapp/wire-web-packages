import {AxiosRequestConfig, AxiosResponse} from 'axios';

import {HttpClient} from '../http';
import {Invitation, InvitationList, InvitationRequest} from '../invitation';

export default class InvitationAPI {
  constructor(private client: HttpClient) {}

  static get URL() {
    return {
      INFO: 'info',
      INVITATIONS: '/invitations',
    };
  }

  /**
   * Delete a pending invitation by ID.
   * @param invitationId The invitation ID to delete
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/invitation_0
   */
  public deleteInvitation(invitationId: string): Promise<{}> {
    const config: AxiosRequestConfig = {
      method: 'delete',
      url: `${InvitationAPI.URL.INVITATIONS}/${invitationId}`,
    };

    return this.client.sendJSON(config).then(() => ({}));
  }

  /**
   * Get a pending invitation by ID.
   * @param invitationId The invitation ID to get
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/invitation
   */
  public getInvitation(invitationId: string): Promise<Invitation> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${InvitationAPI.URL.INVITATIONS}/${invitationId}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Get invitation info given a code.
   * @param invitationCode The code for the invitation
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/invitation_0_1
   */
  public getInvitationInfo(invitationCode: string): Promise<Invitation> {
    const config: AxiosRequestConfig = {
      data: {
        code: invitationCode,
      },
      method: 'get',
      url: `${InvitationAPI.URL.INVITATIONS}/${InvitationAPI.URL.INFO}`,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * List the sent invitations.
   * @param limit Number of results to return (default 100, max 500)
   * @param emailAddress Email address to start from (ascending)
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/invitations
   */
  public getInvitations(limit: number = 100, emailAddress?: string): Promise<InvitationList> {
    const config: AxiosRequestConfig = {
      data: {
        size: limit,
      },
      method: 'get',
      url: InvitationAPI.URL.INVITATIONS,
    };

    if (emailAddress) {
      config.data.start = emailAddress;
    }

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }

  /**
   * Create and send a new invitation.
   * Note: Invitations are sent by email.
   * @param invitationData The invitation to send
   * @see https://staging-nginz-https.zinfra.io/swagger-ui/#!/users/sendInvitation
   */
  public postInvitation(invitationData: InvitationRequest): Promise<Invitation> {
    const config: AxiosRequestConfig = {
      method: 'post',
      url: InvitationAPI.URL.INVITATIONS,
    };

    return this.client.sendJSON(config).then((response: AxiosResponse) => response.data);
  }
}
