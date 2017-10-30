/*
 * Wire
 * Copyright (C) 2017 Wire Swiss GmbH
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

import {InvoiceData, PaymentBillingData, PaymentPlan} from '.';

interface PaymentData {
  card: {
    brand: string;
    country: string;
    digits: string;
    expMonth: number;
    expYear: number;
    holder: string;
    zip: string;
  };
  billingInfo: PaymentBillingData;
  invoice: InvoiceData;
  plan: PaymentPlan;
  planId: 'wire_annual_plan' | 'wire_monthly_plan';
  seats: number;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  trialEndsAt: number;
}

export default PaymentData;
