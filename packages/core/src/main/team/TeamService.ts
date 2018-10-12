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

import {APIClient} from '@wireapp/api-client';
import {MemberData, Members, NewTeamData, TeamChunkData, TeamData} from '@wireapp/api-client/dist/commonjs/team';

class TeamService {
  constructor(private readonly apiClient: APIClient) {}

  public addMember(teamId: string, member: MemberData): Promise<void> {
    return this.apiClient.teams.member.api.postMembers(teamId, member);
  }

  public createTeam(team: NewTeamData): Promise<void> {
    return this.apiClient.teams.team.api.postTeam(team);
  }

  public deleteTeam(teamId: string, password: string): Promise<void> {
    return this.apiClient.teams.team.api.deleteTeam(teamId, password);
  }

  public getMembers(teamId: string): Promise<Members> {
    return this.apiClient.teams.member.api.getMembers(teamId);
  }

  public getTeam(teamId: string): Promise<TeamData> {
    return this.apiClient.teams.team.api.getTeam(teamId);
  }

  public getTeams(): Promise<TeamChunkData> {
    return this.apiClient.teams.team.api.getTeams();
  }

  public removeMember(teamId: string, userId: string, password: string): Promise<void> {
    return this.apiClient.teams.member.api.deleteMember(teamId, userId, password);
  }

  public updateMember(teamId: string, member: MemberData): Promise<void> {
    return this.apiClient.teams.member.api.putMembers(teamId, member);
  }

  public updateTeam(team: TeamData): Promise<void> {
    return this.apiClient.teams.team.api.putTeam(team);
  }
}

export {TeamService};
