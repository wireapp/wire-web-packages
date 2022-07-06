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

export enum FeatureStatus {
  DISABLED = 'disabled',
  ENABLED = 'enabled',
}

export enum FeatureLockStatus {
  LOCKED = 'locked',
  UNLOCKED = 'unlocked',
}

export interface FeatureWithoutConfig {
  status: FeatureStatus;
  lockStatus?: FeatureLockStatus;
}
export interface Feature<T extends FeatureConfig> extends FeatureWithoutConfig {
  config: T;
}

export interface FeatureConfig {}

export interface FeatureAppLockConfig extends FeatureConfig {
  enforceAppLock: boolean;
  inactivityTimeoutSecs: number;
}

export enum SelfDeletingTimeout {
  OFF = 0,
  SECONDS_10 = 10,
  MINUTES_5 = 300,
  HOURS_1 = 3_600,
  DAYS_1 = 86_400,
  WEEKS_1 = 604_800,
  WEEKS_4 = 2_419_200,
}

export interface FeatureSelfDeletingMessagesConfig extends FeatureConfig {
  enforcedTimeoutSeconds: SelfDeletingTimeout | number;
}

export interface FeatureClassifiedDomainsConfig extends FeatureConfig {
  domains: string[];
}
export interface FeatureMLSConfig extends FeatureConfig {
  config: {
    allowedCipherSuites: number[];
    defaultCipherSuite: number;
    defaultProtocol: 'proteus' | 'mls';
    protocolToggleUsers: string[];
  };
}

export type FeatureAppLock = Feature<FeatureAppLockConfig>;
export type FeatureClassifiedDomains = Feature<FeatureClassifiedDomainsConfig>;
export type FeatureConferenceCalling = FeatureWithoutConfig;
export type FeatureDigitalSignature = FeatureWithoutConfig;
export type FeatureConversationGuestLink = FeatureWithoutConfig;
export type FeatureFileSharing = FeatureWithoutConfig;
export type FeatureLegalhold = FeatureWithoutConfig;
export type FeatureSearchVisibility = FeatureWithoutConfig;
export type FeatureSelfDeletingMessages = Feature<FeatureSelfDeletingMessagesConfig>;
export type FeatureMLS = Feature<FeatureMLSConfig>;
export type FeatureSSO = FeatureWithoutConfig;
export type FeatureSndFactorPassword = FeatureWithoutConfig;
export type FeatureValidateSAMLEmails = FeatureWithoutConfig;
export type FeatureVideoCalling = FeatureWithoutConfig;
