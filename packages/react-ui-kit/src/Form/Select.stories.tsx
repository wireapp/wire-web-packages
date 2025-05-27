/*
 * Wire
 * Copyright (C) 2025 Wire Swiss GmbH
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

import type {Meta, StoryObj} from '@storybook/react';

import {Select} from './Select';

const options = [
  {value: '', label: 'Select an option'},
  {value: '1', label: 'Option 1'},
  {value: '2', label: 'Option 2'},
  {value: '3', label: 'Option 3'},
];

const meta = {
  title: 'Form/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 'default-select',
    dataUieName: 'default-select',
    options,
  },
};

export const WithLabel: Story = {
  args: {
    id: 'select-example',
    dataUieName: 'select-with-label',
    options,
    label: 'Choose an option',
  },
};

export const Invalid: Story = {
  args: {
    id: 'invalid-select',
    dataUieName: 'invalid-select',
    options,
    markInvalid: true,
  },
};

export const Disabled: Story = {
  args: {
    id: 'disabled-select',
    dataUieName: 'disabled-select',
    options,
    disabled: true,
  },
};
