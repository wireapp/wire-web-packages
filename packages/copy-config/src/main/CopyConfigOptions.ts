/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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

export interface CopyConfigOptions {
  /**
   * An external directory to copy from.
   * Disables cloning to and initial deletion of the source directory.
   */
  externalDir?: string;
  /**
   * Which files to copy (`{source: destination}`)
   */
  files?: {
    [source: string]: string | string[];
  };
  /**
   * From where to clone the configuration.
   * If no version is specified, `master` branch is used.
   */
  repositoryUrl?: string;
}
