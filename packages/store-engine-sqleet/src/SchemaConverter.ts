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
  INTEGER = 'integer',
  // See https://stackoverflow.com/a/8417411
  JSON = 'json',
  REAL = 'real',
  TEXT = 'text',
}

export type SQLiteTableDefinition<T> = Partial<Record<keyof T, SQLiteType>>;

export type SQLiteDatabaseDefinition<T> = Record<string, SQLiteTableDefinition<T>>;

export function mapPropertiesToColumns<T>(properties: T): SQLiteTableDefinition<T> {
  const definition: SQLiteTableDefinition<T> = {};
  for (const key in properties) {
    definition[key] = mapValueToType(properties[key]);
  }
  return definition;
}

export function mapValueToType(value: any): SQLiteType {
  const isInt = (n: number) => n % 1 === 0;

  let jsType = '';

  try {
    jsType = value.constructor.name;
  } catch (error) {
    // Info: Can happen when the value is "null"
    jsType = 'String';
  }

  switch (jsType) {
    case 'Array': {
      return SQLiteType.JSON;
    }
    case 'Boolean': {
      return SQLiteType.BOOLEAN;
    }
    case 'Date': {
      return SQLiteType.DATETIME;
    }
    case 'Number': {
      return isInt(value as number) ? SQLiteType.INTEGER : SQLiteType.REAL;
    }
    case 'Object': {
      return SQLiteType.JSON;
    }
    case 'String': {
      return SQLiteType.TEXT;
    }
    default: {
      return SQLiteType.TEXT;
    }
  }
}

export const escape = (value: string, delimiter: string = `"`) => {
  return `${delimiter}${value.replace(new RegExp(delimiter, 'g'), `\\${delimiter}`)}${delimiter}`;
};

export const escapeTableName = (tableName: string) => {
  return escape(tableName, '`');
};

export function createTableIfNotExists<T>(tableName: string, columns: SQLiteTableDefinition<T>): string {
  const statements = ['key varchar(255) PRIMARY KEY'].concat(
    Object.entries(columns).map(([key, type]) => `${key} ${type}`)
  );
  return `CREATE TABLE IF NOT EXISTS ${escapeTableName(tableName)} (${statements.join(',')});`;
}
