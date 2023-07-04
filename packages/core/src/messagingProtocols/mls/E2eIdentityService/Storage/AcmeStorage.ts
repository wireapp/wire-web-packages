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

import {AuthData, AuthDataSchema, InitialData, InitialDataSchema, OrderData} from './AcmeStorage.schema';

import {LocalStorageStore} from '../../../../util/LocalStorageStore';

const HandleKey = 'Handle';
const AuthDataKey = 'AuthData';
const OderDataKey = 'OrderData';
const InitialDataKey = 'InitialData';
const CertificateDataKey = 'CertificateData';

const AcmeStore = LocalStorageStore<string>('AcmeStorage');

const storeHandle = (handle: string) => AcmeStore.add(HandleKey, window.btoa(handle));
const storeOrderData = (data: OrderData) => AcmeStore.add(OderDataKey, window.btoa(JSON.stringify(data)));
const storeAuthData = (data: AuthData) => AcmeStore.add(AuthDataKey, window.btoa(JSON.stringify(data)));
const storeInitialData = (data: InitialData) => AcmeStore.add(InitialDataKey, window.btoa(JSON.stringify(data)));
const storeCertificate = (data: string) => AcmeStore.add(CertificateDataKey, window.btoa(data));

const hasHandle = () => AcmeStore.has(HandleKey);
const hasInitialData = () => AcmeStore.has(InitialDataKey);
const hasCertificateData = () => AcmeStore.has(CertificateDataKey);

const getAndVerifyHandle = () => {
  const handle = AcmeStore.get(HandleKey);
  if (!handle) {
    throw new Error('ACME: No handle found');
  }
  AcmeStore.remove(HandleKey);
  const atob = window.atob(handle);
  return atob;
};

const getAndVerifyAuthData = (): AuthData => {
  const data = AcmeStore.get(AuthDataKey);
  if (!data) {
    throw new Error('ACME: AuthData not found');
  }
  AcmeStore.remove(AuthDataKey);
  const atob = window.atob(data);
  return AuthDataSchema.parse(JSON.parse(atob));
};

const getInitialData = (): InitialData => {
  const data = AcmeStore.get(InitialDataKey);
  if (!data) {
    throw new Error('ACME: InitialData not found');
  }
  AcmeStore.remove(InitialDataKey);
  const atob = window.atob(data);
  return InitialDataSchema.parse(JSON.parse(atob));
};

const getAndVerifyOrderData = (): OrderData => {
  const data = AcmeStore.get(OderDataKey);
  if (!data) {
    throw new Error('ACME: OrderData not found');
  }
  AcmeStore.remove(OderDataKey);
  const atob = window.atob(data);
  return JSON.parse(atob);
};

const getCertificateData = (): string => {
  const data = AcmeStore.get(CertificateDataKey);
  if (!data) {
    throw new Error('ACME: CertificateData not found');
  }
  const atob = window.atob(data);
  return atob;
};

export const AcmeStorage = {
  storeHandle,
  storeAuthData,
  storeOrderData,
  storeInitialData,
  storeCertificate,
  hasHandle,
  hasInitialData,
  hasCertificateData,
  getAndVerifyHandle,
  getAndVerifyAuthData,
  getAndVerifyOrderData,
  getInitialData,
  getCertificateData,
};
