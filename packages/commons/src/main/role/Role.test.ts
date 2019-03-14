/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
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

import {MemberData} from '@wireapp/api-client/dist/commonjs/team';
import {Permissions, combinePermissions} from '../permission/Permission';
import {Role, isAdmin, isAtLeastAdmin, isAtLeastMember, isMember, isOwner, roleToPermissions} from './Role';

describe('Role', () => {
  describe('hasPermissions', () => {
    it('INVALID', () => {
      const permissions = roleToPermissions('INVALID');
      expect(permissions).toEqual(combinePermissions([]));
    });

    it('MEMBER', () => {
      const permissions = roleToPermissions(Role.MEMBER);
      expect(permissions).toEqual(
        combinePermissions([
          Permissions.ADD_CONVERSATION_MEMBER,
          Permissions.CREATE_CONVERSATION,
          Permissions.DELETE_CONVERSATION,
          Permissions.GET_MEMBER_PERMISSIONS,
          Permissions.GET_TEAM_CONVERSATIONS,
          Permissions.REMOVE_CONVERSATION_MEMBER,
        ])
      );
    });

    it('ADMIN', () => {
      const permissions = roleToPermissions(Role.ADMIN);
      expect(permissions).toEqual(
        combinePermissions([
          Permissions.ADD_CONVERSATION_MEMBER,
          Permissions.ADD_TEAM_MEMBER,
          Permissions.CREATE_CONVERSATION,
          Permissions.DELETE_CONVERSATION,
          Permissions.GET_MEMBER_PERMISSIONS,
          Permissions.GET_TEAM_CONVERSATIONS,
          Permissions.REMOVE_CONVERSATION_MEMBER,
          Permissions.REMOVE_TEAM_MEMBER,
          Permissions.SET_MEMBER_PERMISSIONS,
          Permissions.SET_TEAM_DATA,
        ])
      );
    });

    it('OWNER', () => {
      const permissions = roleToPermissions(Role.OWNER);
      expect(permissions).toEqual(
        combinePermissions([
          Permissions.ADD_CONVERSATION_MEMBER,
          Permissions.ADD_TEAM_MEMBER,
          Permissions.CREATE_CONVERSATION,
          Permissions.DELETE_CONVERSATION,
          Permissions.DELETE_TEAM,
          Permissions.GET_BILLING,
          Permissions.GET_MEMBER_PERMISSIONS,
          Permissions.GET_TEAM_CONVERSATIONS,
          Permissions.REMOVE_CONVERSATION_MEMBER,
          Permissions.REMOVE_TEAM_MEMBER,
          Permissions.SET_BILLING,
          Permissions.SET_MEMBER_PERMISSIONS,
          Permissions.SET_TEAM_DATA,
        ])
      );
    });
  });

  describe('isMember', () => {
    it('OWNER is false', () => {
      expect(isMember(({permissions: {self: roleToPermissions(Role.OWNER)}} as unknown) as MemberData)).toBe(false);
    });

    it('ADMIN is false', () => {
      expect(isMember(({permissions: {self: roleToPermissions(Role.ADMIN)}} as unknown) as MemberData)).toBe(false);
    });

    it('MEMBER is true', () => {
      expect(isMember(({permissions: {self: roleToPermissions(Role.MEMBER)}} as unknown) as MemberData)).toBe(true);
    });

    it('0 is false', () => {
      expect(isMember(({permissions: {self: 0}} as unknown) as MemberData)).toBe(false);
    });

    it('-1 is false', () => {
      expect(isMember(({permissions: {self: -1}} as unknown) as MemberData)).toBe(false);
    });

    it('string is false', () => {
      expect(isMember(({permissions: {self: 'MEMBER'}} as unknown) as MemberData)).toBe(false);
    });

    it('unset permission is false', () => {
      expect(isMember(({permissions: undefined} as unknown) as MemberData)).toBe(false);
    });

    it('undefined member is false', () => {
      expect(isMember((undefined as unknown) as MemberData)).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('OWNER is false', () => {
      expect(isAdmin(({permissions: {self: roleToPermissions(Role.OWNER)}} as unknown) as MemberData)).toBe(false);
    });

    it('ADMIN is true', () => {
      expect(isAdmin(({permissions: {self: roleToPermissions(Role.ADMIN)}} as unknown) as MemberData)).toBe(true);
    });

    it('MEMBER is false', () => {
      expect(isAdmin(({permissions: {self: roleToPermissions(Role.MEMBER)}} as unknown) as MemberData)).toBe(false);
    });

    it('0 is false', () => {
      expect(isAdmin(({permissions: {self: 0}} as unknown) as MemberData)).toBe(false);
    });

    it('-1 is false', () => {
      expect(isAdmin(({permissions: {self: -1}} as unknown) as MemberData)).toBe(false);
    });

    it('string is false', () => {
      expect(isAdmin(({permissions: {self: 'ADMIN'}} as unknown) as MemberData)).toBe(false);
    });

    it('unset permission is false', () => {
      expect(isAdmin(({permissions: undefined} as unknown) as MemberData)).toBe(false);
    });

    it('undefined member is false', () => {
      expect(isAdmin((undefined as unknown) as MemberData)).toBe(false);
    });
  });

  describe('isOwner', () => {
    it('OWNER is true', () => {
      expect(isOwner(({permissions: {self: roleToPermissions(Role.OWNER)}} as unknown) as MemberData)).toBe(true);
    });

    it('ADMIN is false', () => {
      expect(isOwner(({permissions: {self: roleToPermissions(Role.ADMIN)}} as unknown) as MemberData)).toBe(false);
    });

    it('MEMBER is false', () => {
      expect(isOwner(({permissions: {self: roleToPermissions(Role.MEMBER)}} as unknown) as MemberData)).toBe(false);
    });

    it('0 is false', () => {
      expect(isOwner(({permissions: {self: 0}} as unknown) as MemberData)).toBe(false);
    });

    it('-1 is false', () => {
      expect(isOwner(({permissions: {self: -1}} as unknown) as MemberData)).toBe(false);
    });

    it('string is false', () => {
      expect(isOwner(({permissions: {self: 'OWNER'}} as unknown) as MemberData)).toBe(false);
    });

    it('unset permission is false', () => {
      expect(isOwner(({permissions: undefined} as unknown) as MemberData)).toBe(false);
    });

    it('undefined member is false', () => {
      expect(isOwner((undefined as unknown) as MemberData)).toBe(false);
    });
  });

  describe('isAtLeastMember', () => {
    it('OWNER is true', () => {
      expect(isAtLeastMember(({permissions: {self: roleToPermissions(Role.OWNER)}} as unknown) as MemberData)).toBe(
        true
      );
    });

    it('ADMIN is true', () => {
      expect(isAtLeastMember(({permissions: {self: roleToPermissions(Role.ADMIN)}} as unknown) as MemberData)).toBe(
        true
      );
    });

    it('MEMBER is true', () => {
      expect(isAtLeastMember(({permissions: {self: roleToPermissions(Role.MEMBER)}} as unknown) as MemberData)).toBe(
        true
      );
    });

    it('Unknown above is false', () => {
      expect(
        isAtLeastMember(({permissions: {self: roleToPermissions(Role.MEMBER) + 1234}} as unknown) as MemberData)
      ).toBe(false);
    });

    it('0 is false', () => {
      expect(isAtLeastMember(({permissions: {self: 0}} as unknown) as MemberData)).toBe(false);
    });

    it('-1 is false', () => {
      expect(isAtLeastMember(({permissions: {self: -1}} as unknown) as MemberData)).toBe(false);
    });

    it('string is false', () => {
      expect(isAtLeastMember(({permissions: {self: 'OWNER'}} as unknown) as MemberData)).toBe(false);
    });

    it('unset permission is false', () => {
      expect(isAtLeastMember(({permissions: undefined} as unknown) as MemberData)).toBe(false);
    });

    it('undefined member is false', () => {
      expect(isAtLeastMember((undefined as unknown) as MemberData)).toBe(false);
    });
  });

  describe('isAtLeastAdmin', () => {
    it('OWNER is true', () => {
      expect(isAtLeastAdmin(({permissions: {self: roleToPermissions(Role.OWNER)}} as unknown) as MemberData)).toBe(
        true
      );
    });

    it('ADMIN is true', () => {
      expect(isAtLeastAdmin(({permissions: {self: roleToPermissions(Role.ADMIN)}} as unknown) as MemberData)).toBe(
        true
      );
    });

    it('MEMBER is false', () => {
      expect(isAtLeastAdmin(({permissions: {self: roleToPermissions(Role.MEMBER)}} as unknown) as MemberData)).toBe(
        false
      );
    });

    it('Unknown above is false', () => {
      expect(
        isAtLeastAdmin(({permissions: {self: roleToPermissions(Role.ADMIN) + 1234}} as unknown) as MemberData)
      ).toBe(false);
    });

    it('0 is false', () => {
      expect(isAtLeastAdmin(({permissions: {self: 0}} as unknown) as MemberData)).toBe(false);
    });

    it('-1 is false', () => {
      expect(isAtLeastAdmin(({permissions: {self: -1}} as unknown) as MemberData)).toBe(false);
    });

    it('string is false', () => {
      expect(isAtLeastAdmin(({permissions: {self: 'OWNER'}} as unknown) as MemberData)).toBe(false);
    });

    it('unset permission is false', () => {
      expect(isAtLeastAdmin(({permissions: undefined} as unknown) as MemberData)).toBe(false);
    });

    it('undefined member is false', () => {
      expect(isAtLeastAdmin((undefined as unknown) as MemberData)).toBe(false);
    });
  });
});
