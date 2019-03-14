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
import {Permissions, combinePermissions, hasPermissions} from '../permission/Permission';

enum Role {
  ADMIN = 'admin',
  PARTNER = 'partner',
  MEMBER = 'member',
  OWNER = 'owner',
  NONE = 'none',
}

const roleToPermissions = (role: string): Permissions => {
  switch (role.toLowerCase()) {
    case Role.OWNER: {
      return combinePermissions([
        roleToPermissions(Role.ADMIN),
        Permissions.DELETE_TEAM,
        Permissions.GET_BILLING,
        Permissions.SET_BILLING,
      ]);
    }
    case Role.ADMIN: {
      return combinePermissions([
        roleToPermissions(Role.MEMBER),
        Permissions.ADD_TEAM_MEMBER,
        Permissions.REMOVE_TEAM_MEMBER,
        Permissions.SET_MEMBER_PERMISSIONS,
        Permissions.SET_TEAM_DATA,
      ]);
    }
    case Role.MEMBER: {
      return combinePermissions([
        roleToPermissions(Role.PARTNER),
        Permissions.ADD_CONVERSATION_MEMBER,
        Permissions.DELETE_CONVERSATION,
        Permissions.GET_MEMBER_PERMISSIONS,
        Permissions.REMOVE_CONVERSATION_MEMBER,
      ]);
    }
    case Role.PARTNER: {
      return combinePermissions([Permissions.CREATE_CONVERSATION, Permissions.GET_TEAM_CONVERSATIONS]);
    }
    default: {
      return 0;
    }
  }
};

const permissionsToRole = (permissions: Permissions): Role => {
  if (hasPermissions(permissions, roleToPermissions(Role.OWNER))) {
    return Role.OWNER;
  }
  if (hasPermissions(permissions, roleToPermissions(Role.ADMIN))) {
    return Role.ADMIN;
  }
  if (hasPermissions(permissions, roleToPermissions(Role.MEMBER))) {
    return Role.MEMBER;
  }
  if (hasPermissions(permissions, roleToPermissions(Role.PARTNER))) {
    return Role.PARTNER;
  }
  return Role.NONE;
};

const isPartner = (member: MemberData): boolean => {
  return member && member.permissions && permissionsToRole(member.permissions.self) === Role.PARTNER;
};

const isMember = (member: MemberData): boolean => {
  return member && member.permissions && permissionsToRole(member.permissions.self) === Role.MEMBER;
};

const isAdmin = (member: MemberData): boolean => {
  return member && member.permissions && permissionsToRole(member.permissions.self) === Role.ADMIN;
};

const isOwner = (member: MemberData): boolean => {
  return member && member.permissions && permissionsToRole(member.permissions.self) === Role.OWNER;
};

const isAtLeastPartner = (member: MemberData): boolean => {
  return isPartner(member) || isMember(member) || isAdmin(member) || isOwner(member);
};

const isAtLeastMember = (member: MemberData): boolean => {
  return isMember(member) || isAdmin(member) || isOwner(member);
};

const isAtLeastAdmin = (member: MemberData): boolean => {
  return isAdmin(member) || isOwner(member);
};

const isAtLeastEqual = (member: MemberData, otherMember: MemberData): boolean => {
  return (
    (isOwner(member) && isOwner(otherMember)) ||
    (isAtLeastAdmin(member) && isAdmin(otherMember)) ||
    (isAtLeastMember(member) && isMember(otherMember)) ||
    (isAtLeastPartner(member) && isPartner(otherMember))
  );
};

export {
  Role,
  roleToPermissions,
  permissionsToRole,
  isPartner,
  isMember,
  isAdmin,
  isOwner,
  isAtLeastPartner,
  isAtLeastMember,
  isAtLeastAdmin,
  isAtLeastEqual,
};
