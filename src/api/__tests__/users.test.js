
import { app } from '../../../src'
import request from 'supertest'
import {
  setupMongooseDb,
  teardownMongooseDb
} from '../../lib/testUtils'

import controller from '../users'
import User from '../../models/user'

beforeAll(async () => {
  app.use('/', controller({}));
  await setupMongooseDb()
  await User.remove()
})

afterAll(teardownMongooseDb)

describe('User', () => {

  test('It should be able to list users for admin', async () => {
    const user = new User({ email: 'info@me.com', username: 'dominiek' });
    await user.save()
    const response = await request(app).get('/')
    const { result, error } = response.body
    expect(error).toBe(undefined)
    expect(result.length).toBe(1)
    const resultUser = result[0]
    expect(typeof resultUser._id).toBe('string')
  });

});
