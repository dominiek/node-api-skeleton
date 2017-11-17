
import { app, jsonErrorHandler } from '../../../src'
import request from 'supertest'
import {
  setupMongooseDb,
  teardownMongooseDb,
  createTestUserWithSession,
  generateSessionHeader
} from '../../lib/testUtils'

import controller from '../users'
import User from '../../models/user'

beforeAll(async () => {
  app.use('/', controller({}));
  app.use(jsonErrorHandler)

  await setupMongooseDb()
  await User.remove()
})

beforeEach(async () => {
  await User.remove()
})

afterAll(teardownMongooseDb)

describe('User', () => {

  test('It should be able to list users for admin (permission denied)', async () => {
    const [user, token] = await createTestUserWithSession('john')

    const response = await request(app)
      .get('/')
      .set(...generateSessionHeader(token))
    const { result, error } = response.body
    expect(error.message).toBe('Could not authenticate user (invalid permissions)')
  });

  test('It should be able to list users for admin', async () => {
    const [adminUser, adminToken] = await createTestUserWithSession('dominiek', 'admin')
    const response = await request(app)
      .get('/')
      .set(...generateSessionHeader(adminToken))
    const { result, error } = response.body
    expect(error).toBe(undefined)
    expect(result.length).toBe(1)
    const resultUser = result[0]
    expect(typeof resultUser._id).toBe('string')
  });

});
