/*
 * Wire
 * Copyright (C) 2021 Wire Swiss GmbH
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

import {
  FeatureAppLock,
  FeatureDigitalSignature,
  FeatureConferenceCalling,
  FeatureVideoCalling,
  FeatureLegalhold,
  FeatureFileSharing,
  FeatureVideoMessage,
  FeatureAudioMessage,
  FeatureSSO,
  FeatureSearchVisibility,
  FeatureValidateSAMLEmails,
} from '../feature';

export type TeamFeatureConfigurationUpdateEventData =
  | FeatureAppLock
  | FeatureDigitalSignature
  | FeatureConferenceCalling
  | FeatureVideoCalling
  | FeatureVideoMessage
  | FeatureAudioMessage
  | FeatureFileSharing
  | FeatureLegalhold
  | FeatureSSO
  | FeatureSearchVisibility
  | FeatureValidateSAMLEmails;
