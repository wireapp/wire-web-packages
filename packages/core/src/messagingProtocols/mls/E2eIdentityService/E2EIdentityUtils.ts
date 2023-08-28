/*
 * Wire
 * Copyright (C) 2023 Wire Swiss GmbH
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

import {DelayTimerService} from './DelayTimer/DelayTimer';
import {E2EIStorage} from './Storage/E2EIStorage';

// Checks if there is a certificate stored in the local storage
function hasActiveCertificate(): boolean {
  return E2EIStorage.has.certificateData();
}

// Returns the certificate data stored in the local storage
function getCertificateData(): string | undefined {
  try {
    return E2EIStorage.get.certificateData();
  } catch (error) {
    console.error('ACME: Failed to get stored certificate', error);
    return undefined;
  }
}

// If we have a handle in the local storage, we are in the enrollment process (this handle is saved before oauth redirect)
function isEnrollmentInProgress(): boolean {
  return E2EIStorage.has.handle();
}

// Returns a DelayTimerService instance with the given grace period
function getDelayTimerInstance(gracePeriodInMS: number): DelayTimerService {
  return DelayTimerService.getInstance({
    delayPeriodExpiredCallback: () => null,
    gracePeriodExpiredCallback: () => null,
    gracePeriodInMS,
  });
}

function clearAllProgress(): void {
  E2EIStorage.remove.temporaryData();
}

// This export is meant to be accessible from the outside (e.g the Webapp / UI)
export const E2EIUtils = {
  hasActiveCertificate,
  getCertificateData,
  isEnrollmentInProgress,
  getDelayTimerInstance,
  clearAllProgress,
};
