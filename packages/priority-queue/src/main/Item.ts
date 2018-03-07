//
// Wire
// Copyright (C) 2018 Wire Swiss GmbH
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program. If not, see http://www.gnu.org/licenses/.
//

import Priority from './Priority';

export default class Item {
  fn: Function = () => {}; // original business logic
  label: string = '';
  priority: number = Priority.MEDIUM;
  reject: Function = () => {}; // wrapped "reject" of "fn"
  resolve: Function = () => {}; // wrapped "resolve" of "fn"
  retry: number | undefined = 0; // number of retries for rejecting Promises
  timestamp: number = 0; // time when the item has been added to the queue
}
