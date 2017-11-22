//
// Wire
// Copyright (C) 2017 Wire Swiss GmbH
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

import {UserAsset} from '../user';
import TeamData from '../team/team/TeamData';

interface RegisterData {
  accent_id?: number;
  locale?: string;
  email?: string;
  email_code?: string;
  name: string;
  password?: string;
  invitation_code?: string;
  label?: string;
  phone?: string;
  phone_code?: string;
  assets?: UserAsset[];
  team?: TeamData;
}

export default RegisterData;
