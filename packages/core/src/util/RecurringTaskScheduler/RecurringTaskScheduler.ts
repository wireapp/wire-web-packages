/*
 * Wire
 * Copyright (C) 2022 Wire Swiss GmbH
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

import {TimeUtil} from '@wireapp/commons';
import {TaskScheduler} from '../TaskScheduler';
import {LowPrecisionTaskScheduler} from '../LowPrecisionTaskScheduler';
import {saveState, loadState} from './RecurringTaskScheduler.store';

interface TaskParams {
  every: number;
  task: () => void;
  key: string;
}

export function registerRecurringTask({every, task, key}: TaskParams) {
  const lastFireDate = loadState(key) ?? Date.now();

  const taskConfig = {
    firingDate: lastFireDate + every,
    key,
    task() {
      saveState(key, Date.now());
      task();
      registerRecurringTask({every, task, key});
    },
  };

  if (every > TimeUtil.TimeInMillis.DAY) {
    // If the firing date is in more that a day, we could switch to a lowPrecision scheduler that will avoid hitting the limit of setTimeout
    LowPrecisionTaskScheduler.addTask({...taskConfig, intervalDelay: TimeUtil.TimeInMillis.MINUTE});
  } else {
    TaskScheduler.addTask(taskConfig);
  }
}

export function cancelRecurringTask(taskKey: string) {
  TaskScheduler.cancelTask(taskKey);
  LowPrecisionTaskScheduler.cancelTask({intervalDelay: TimeUtil.TimeInMillis.MINUTE, key: taskKey});
}
