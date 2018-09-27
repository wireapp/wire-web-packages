/*
 * Wire
 * Copyright (C) 2018 Wire Swiss GmbH
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

import {AxiosRequestConfig} from 'axios';

import {
  PaymentBillingData,
  PaymentData,
  PaymentDataUpdate,
  PaymentPlan,
  PaymentStripeCharge,
  PaymentStripeInvoices,
  PaymentStripePlan,
} from '.';
import {HttpClient} from '../../http';

class PaymentAPI {
  static readonly DEFAULT_INVOICES_CHUNK_SIZE = 10;
  constructor(private readonly client: HttpClient) {}

  static get URL() {
    return {
      BILLING: 'billing',
      CHARGES: 'charges',
      CURRENCIES: 'currencies',
      INFO: 'info',
      INVOICES: 'invoices',
      PLAN: 'plan',
      PLANS: 'plans',
      TEAMS: '/teams',
    };
  }

  public putPaymentData(teamId: string, paymentData: PaymentDataUpdate): Promise<void> {
    const config: AxiosRequestConfig = {
      data: paymentData,
      method: 'put',
      url: `${PaymentAPI.URL.TEAMS}/${teamId}/${PaymentAPI.URL.BILLING}`,
    };

    return this.client.sendJSON<void>(config).then(response => response.data);
  }

  public getPaymentData(teamId: string): Promise<PaymentData> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${PaymentAPI.URL.TEAMS}/${teamId}/${PaymentAPI.URL.BILLING}`,
    };

    return this.client.sendJSON<PaymentData>(config).then(response => response.data);
  }

  public deletePaymentData(teamId: string, data: Object): Promise<PaymentData> {
    const config: AxiosRequestConfig = {
      data,
      method: 'delete',
      url: `${PaymentAPI.URL.TEAMS}/${teamId}/${PaymentAPI.URL.BILLING}`,
    };

    return this.client.sendJSON<PaymentData>(config).then(response => response.data);
  }

  public putPaymentBilling(teamId: string, billingInfo: PaymentBillingData): Promise<void> {
    const config: AxiosRequestConfig = {
      data: billingInfo,
      method: 'put',
      url: `${PaymentAPI.URL.TEAMS}/${teamId}/${PaymentAPI.URL.BILLING}/${PaymentAPI.URL.INFO}`,
    };

    return this.client.sendJSON<void>(config).then(response => response.data);
  }

  public getPaymentBilling(teamId: string): Promise<PaymentBillingData> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${PaymentAPI.URL.TEAMS}/${teamId}/${PaymentAPI.URL.BILLING}/${PaymentAPI.URL.INFO}`,
    };

    return this.client.sendJSON<PaymentBillingData>(config).then(response => response.data);
  }

  public putPaymentPlan(teamId: string, plan: PaymentPlan): Promise<void> {
    const config: AxiosRequestConfig = {
      data: plan,
      method: 'put',
      url: `${PaymentAPI.URL.TEAMS}/${teamId}/${PaymentAPI.URL.BILLING}/${PaymentAPI.URL.PLAN}/${plan.id}`,
    };

    return this.client.sendJSON<void>(config).then(response => response.data);
  }

  public getPlans(teamId: string): Promise<PaymentStripePlan[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${PaymentAPI.URL.TEAMS}/${teamId}/${PaymentAPI.URL.BILLING}/${PaymentAPI.URL.PLANS}`,
    };

    return this.client.sendJSON<PaymentStripePlan[]>(config).then(response => response.data);
  }

  public getCharges(teamId: string): Promise<PaymentStripeCharge[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${PaymentAPI.URL.TEAMS}/${teamId}/${PaymentAPI.URL.BILLING}/${PaymentAPI.URL.CHARGES}`,
    };

    return this.client.sendJSON<PaymentStripeCharge[]>(config).then(response => response.data);
  }

  public getInvoices(
    teamId: string,
    limit: number = PaymentAPI.DEFAULT_INVOICES_CHUNK_SIZE,
    startAfterInvoiceId?: string
  ): Promise<PaymentStripeInvoices> {
    const config: AxiosRequestConfig = {
      method: 'get',
      params: {
        size: limit,
        start: startAfterInvoiceId,
      },
      url: `${PaymentAPI.URL.TEAMS}/${teamId}/${PaymentAPI.URL.BILLING}/${PaymentAPI.URL.INVOICES}`,
    };

    return this.client.sendJSON<PaymentStripeInvoices>(config).then(response => response.data);
  }

  public getSupportedCurrencies(teamId: string): Promise<string[]> {
    const config: AxiosRequestConfig = {
      method: 'get',
      url: `${PaymentAPI.URL.TEAMS}/${teamId}/${PaymentAPI.URL.BILLING}/${PaymentAPI.URL.CURRENCIES}`,
    };

    return this.client.sendJSON<string[]>(config).then(response => response.data);
  }
}

export {PaymentAPI};
