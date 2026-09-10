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

import {getOpenGraphData, getOpenGraphDataSafe} from './index';

describe('@wireapp/open-graph', () => {
  describe('getOpenGraphData', () => {
    it('should export a function', () => {
      expect(typeof getOpenGraphData).toBe('function');
    });
  });

  describe('getOpenGraphDataSafe', () => {
    it('should export a function', () => {
      expect(typeof getOpenGraphDataSafe).toBe('function');
    });

    it('should return null on error', async () => {
      const result = await getOpenGraphDataSafe('https://invalid-url-that-will-fail-12345.invalid');
      expect(result).toBeNull();
    });
  });
});
