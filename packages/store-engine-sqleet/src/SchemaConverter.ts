/*
 * Wire
 * Copyright (C) 2019 Wire Swiss GmbH
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

export enum SQLiteType {
  BOOLEAN = 'boolean',
  DATETIME = 'datetime',
  REAL = 'real',
  TEXT = 'text',
}

export type SQLiteTableDefinition = Record<string, SQLiteType>;

export type SQLiteDatabaseDefinition = Record<string, SQLiteTableDefinition>;

export function mapPropertiesToColumns(value: Object): SQLiteTableDefinition {
  const columns: SQLiteTableDefinition = {};
  Object.entries(value).forEach(([key, value]) => {
    columns[key] = mapValueToType(value);
  });
  return columns;
}

export function mapValueToType(value: any): SQLiteType {
  let jsType = '';

  try {
    jsType = value.constructor.name;
  } catch (error) {
    // Info: Can happen when the value is "null"
    jsType = 'String;';
  }

  switch (jsType) {
    case 'Array': {
      return SQLiteType.TEXT;
    }
    case 'Boolean': {
      return SQLiteType.BOOLEAN;
    }
    case 'Date': {
      return SQLiteType.DATETIME;
    }
    case 'Number': {
      return SQLiteType.REAL;
    }
    case 'String': {
      return SQLiteType.TEXT;
    }
    default:
      return SQLiteType.TEXT;
  }
}

export function createTableIfNotExists(tableName: string, columns: SQLiteTableDefinition): string {
  const statements: string[] = ['key text'];

  Object.entries(columns).forEach(entry => {
    statements.push(`${entry[0]} ${entry[1]}`);
  });

  return `CREATE TABLE IF NOT EXISTS ${tableName} (${statements.join(',')});`;
}
