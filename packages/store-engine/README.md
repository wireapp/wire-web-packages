# Wire

This repository is part of the source code of Wire. You can find more information at [wire.com](https://wire.com) or by contacting opensource@wire.com.

You can find the published source code at [github.com/wireapp](https://github.com/wireapp).

For licensing information, see the attached LICENSE file and the list of third-party licenses at [wire.com/legal/licenses/](https://wire.com/legal/licenses/).

## Store Engine

This package provides an interface to operate with various storage technologies in a uniform manner. There is a `MemoryEngine` which serves as an example.

Additional storage engines can be found in separate packages such as:

- [FileEngine](https://github.com/wireapp/wire-web-packages/tree/master/packages/store-engine-fs)
- [FileSystemEngine](https://github.com/wireapp/wire-web-packages/tree/master/packages/store-engine-bro-fs)
- [IndexedDBEngine](https://github.com/wireapp/wire-web-packages/tree/master/packages/store-engine-dexie)

### Motivation

Nowadays there are more and more storage possibilities and developers must be familiar with the characteristics of each individual solution to reliably store data. Because it can be sometimes hard to keep up with the highly dynamic world of data storages, we have developed a system which unifies the use of different storages / databases.

### Quickstart

#### Engine instantiation

```typescript
const {MemoryEngine} = require('@wireapp/store-engine');
const engine = new MemoryEngine('my-database');
```

#### Transient store

As a bonus to the store engine, we built a transient store which deletes data after a specified [TTL](https://en.wikipedia.org/wiki/Time_to_live):

```typescript
import {Store, MemoryEngine} from '@wireapp/store-engine';

const engine = new MemoryEngine('my-favorite-actors');
const store = new Store.TransientStore(engine);

const ttl = 1000;

await store.init('the-simpsons');
const transientBundle = store.set('bart', {name: 'Bart Simpson'}, ttl));
console.log(`The record of "${transientBundle.payload.name}" expires in "${transientBundle.expires}" ms.`);
```

### API

No matter which engine you use, they all support common [CRUD operations](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete).

**Example**

The following API calls we use this data:

```typescript
const TABLE_NAME = 'the-simpsons';
const PRIMARY_KEY = 'lisa-simpson';
const ENTITY = {name: 'Lisa Simpson'};
```

#### create

```typescript
const primaryKey = await engine.create(TABLE_NAME, PRIMARY_KEY, ENTITY);
console.log(`Saved record with primary key "${primaryKey}".`);
```

#### delete

```typescript
const primaryKey = await engine.delete(TABLE_NAME, PRIMARY_KEY);
console.log(`Deleted record with primary key "${primaryKey}".`);
```

#### deleteAll

```typescript
const wasDeleted = await engine.deleteAll(TABLE_NAME);
if (wasDeleted) {
  console.log('The Simpsons have been deleted. Poor Simpsons!');
}
```

#### purge

```typescript
await engine.purge();
console.log(`The Simpson universe has been deleted. D'oh!`);
```

#### read

```typescript
const record = await engine.read(TABLE_NAME, PRIMARY_KEY);
console.log(`Her name is "${record.name}".`);
```

#### readAll

```typescript
const records = await engine.readAll(TABLE_NAME);
console.log(`There are "${records.length}" Simpsons in our database.`);
```

#### readAllPrimaryKeys

```typescript
const primaryKeys = await engine.readAllPrimaryKeys(TABLE_NAME);
console.log(`Identifiers of our Simpsons: "${primaryKeys.join(', ')}"`);
```

#### update

```typescript
await engine.update(TABLE_NAME, PRIMARY_KEY, {brother: 'Bart Simpson'});
const updatedRecord = await engine.read(TABLE_NAME, PRIMARY_KEY);
console.log(`The brother of "${updatedRecord.name}" is "${updatedRecord.brother}".`):
```
