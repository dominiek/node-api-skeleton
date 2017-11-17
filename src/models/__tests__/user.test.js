
import { setupMongooseDb, teardownMongooseDb } from 'lib/testUtils'
import User from '../user'

beforeAll((done) => {
  setupMongooseDb(() => {
    User.remove({}, () => done())
  })
})

afterAll(teardownMongooseDb)

describe('User', () => {

  test('It should be able to CRUD a user', (done) => {
    const user = new User({ email: 'info@me.com' });
    user.save((err) => {
      expect(err).toBe(null)
      User.find({email: 'info@me.com'}, (err, results) => {
        expect(err).toBe(null)
        expect(results.length).toBe(1)
        done()
      })
    })
  });

});
