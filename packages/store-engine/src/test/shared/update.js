const StoreEngine = require('@wireapp/store-engine');

const TABLE_NAME = 'the-simpsons';

module.exports = {
  'fails if the record does not exist.': (done, engine) => {
    const PRIMARY_KEY = 'primary-key';

    const entity = {
      name: 'Old monitor',
    };

    engine
      .update(TABLE_NAME, PRIMARY_KEY, entity)
      .then(() => done.fail('Update on non-existing record should have failed'))
      .catch(error => {
        expect(error).toEqual(jasmine.any(StoreEngine.error.RecordNotFoundError));
        done();
      });
  },
  'updates an existing database record.': (done, engine) => {
    const PRIMARY_KEY = 'primary-key';

    const entity = {
      name: 'Old monitor',
    };

    const newEntity = {
      age: 177,
      size: {
        height: 1080,
        width: 1920,
      },
    };

    const expectedAmountOfProperties = 2;

    engine
      .create(TABLE_NAME, PRIMARY_KEY, entity)
      .then(() => engine.update(TABLE_NAME, PRIMARY_KEY, newEntity))
      .then(primaryKey => engine.read(TABLE_NAME, primaryKey))
      .then(updatedRecord => {
        expect(updatedRecord.name).toBe(undefined);
        expect(updatedRecord.age).toBe(newEntity.age);
        expect(Object.keys(updatedRecord.size).length).toBe(expectedAmountOfProperties);
        expect(updatedRecord.size.height).toBe(newEntity.size.height);
        expect(updatedRecord.size.width).toBe(newEntity.size.width);
        done();
      })
      .catch(done.fail);
  },
};
