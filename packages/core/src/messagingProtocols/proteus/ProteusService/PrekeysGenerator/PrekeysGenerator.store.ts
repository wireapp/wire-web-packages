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

const storageKey = 'prekeysState';

interface PrekeysState {
  lastGeneratedId: number;
  nbPrekeys: number;
}

const defaultState: PrekeysState = {
  lastGeneratedId: 0,
  nbPrekeys: 0,
};

export function getState(): PrekeysState {
  const value = localStorage.getItem(storageKey);
  return value ? JSON.parse(value) : defaultState;
}

function saveState(state: PrekeysState): void {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

export function createId(): number {
  const currentState = getState();
  const newState = {
    ...currentState,
    lastGeneratedId: currentState.lastGeneratedId + 1,
    nbPrekeys: currentState.nbPrekeys + 1,
  };
  saveState(newState);

  return newState.lastGeneratedId;
}
