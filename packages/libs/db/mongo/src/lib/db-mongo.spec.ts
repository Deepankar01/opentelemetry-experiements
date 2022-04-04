import { dbMongo } from './db-mongo';

describe('dbMongo', () => {
  it('should work', () => {
    expect(dbMongo()).toEqual('db-mongo');
  });
});
