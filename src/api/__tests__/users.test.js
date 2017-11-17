/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import request from 'supertest';
import controller from '../users';
import User from '../../models/user';

import { app, jsonErrorHandler } from '../../../src';
import {
  setupMongooseDb,
  teardownMongooseDb,
  createTestUserWithSession,
  generateSessionHeader,
} from '../../lib/testUtils';

beforeAll(async () => {
  app.use('/', controller({}));
  app.use(jsonErrorHandler);

  await setupMongooseDb();
  await User.remove();
});

beforeEach(async () => {
  await User.remove();
});

afterAll(teardownMongooseDb);

describe('User', () => {
  test('It should be able to register and authenticate a user', async () => {
    let response;
    let result;
    let error;

    const signupParams = {
      username: 'john',
      email: 'john@galt.com',
      password: 'hello',
      passwordRepeat: 'hello',
      name: 'John Galt',
    };
    response = await request(app)
      .post('/')
      .send(signupParams);
    ({ result, error } = response.body);
    expect(error).toBe(undefined);
    expect(result.name).toBe(signupParams.name);
    expect(!!result.hash).toBe(false);
    expect(!!await User.findOne({ username: 'john' })).toBe(true);

    response = await request(app)
      .post('/sessions')
      .send({ email: signupParams.email, password: 'wrong' });
    ({ result, error } = response.body);
    expect(error.message).toBe('Incorrect email or password');

    response = await request(app)
      .post('/sessions')
      .send(signupParams);
    ({ result, error } = response.body);
    expect(error).toBe(undefined);
    expect(!!result.user.hash).toBe(false);
    const { token } = result;

    response = await request(app)
      .get('/self')
      .set(...generateSessionHeader(token));
    ({ result, error } = response.body);
    expect(error).toBe(undefined);
    expect(result.name).toBe(signupParams.name);
    expect(!!result.hash).toBe(false);
  });

  test('It should be update my account', async () => {
    const [, token] = await createTestUserWithSession('john');

    const response = await request(app)
      .post('/self')
      .send({ name: 'John Galt' })
      .set(...generateSessionHeader(token));
    const { error } = response.body;
    expect(error).toBe(undefined);
    expect((await User.findOne({ username: 'john' })).name).toBe('John Galt');
  });

  test('It should be delete my account', async () => {
    const [, token] = await createTestUserWithSession('john');

    const response = await request(app)
      .delete('/self')
      .set(...generateSessionHeader(token));
    const { error } = response.body;
    expect(error).toBe(undefined);
    expect((await User.count())).toBe(0);
  });

  test('It should be able to list users for admin (permission denied)', async () => {
    const [, token] = await createTestUserWithSession('john');

    const response = await request(app)
      .get('/')
      .set(...generateSessionHeader(token));
    const { error } = response.body;
    expect(error.message).toBe('Could not authenticate user (invalid permissions)');
  });

  test('It should be able to list users for admin', async () => {
    const [, adminToken] = await createTestUserWithSession('dominiek', 'admin');
    const response = await request(app)
      .get('/')
      .set(...generateSessionHeader(adminToken));
    const { result, error } = response.body;
    expect(error).toBe(undefined);
    expect(result.length).toBe(1);
    const resultUser = result[0];
    expect(typeof resultUser._id).toBe('string');
  });

  test('It should be able to get a user for admin', async () => {
    const [adminUser, adminToken] = await createTestUserWithSession('dominiek', 'admin');
    const response = await request(app)
      .get(`/${adminUser._id}`)
      .set(...generateSessionHeader(adminToken));
    const { result, error } = response.body;
    expect(error).toBe(undefined);
    expect(result.role).toBe('admin');
  });

  test('It should be able to get a delete user for admin (404)', async () => {
    await createTestUserWithSession('john');
    const [, adminToken] = await createTestUserWithSession('dominiek', 'admin');
    const response = await request(app)
      .delete('/5a0e88cd0f94c22aae7f6f7c')
      .set(...generateSessionHeader(adminToken));
    const { error } = response.body;
    expect(error.message).toBe('No such user');
  });

  test('It should be able to get a delete user for admin', async () => {
    const [user] = await createTestUserWithSession('john');
    const [, adminToken] = await createTestUserWithSession('dominiek', 'admin');
    const response = await request(app)
      .delete(`/${user._id}`)
      .set(...generateSessionHeader(adminToken));
    const { result, error } = response.body;
    expect(error).toBe(undefined);
    expect(result.success).toBe(true);
    expect(await User.count()).toBe(1);
  });

  test('It should be able to get a delete user for admin', async () => {
    const [user] = await createTestUserWithSession('john');
    const [, adminToken] = await createTestUserWithSession('dominiek', 'admin');
    const response = await request(app)
      .post(`/${user._id}`)
      .send({ name: 'John Galt' })
      .set(...generateSessionHeader(adminToken));
    const { error } = response.body;
    expect(error).toBe(undefined);

    const refreshedUser = await User.findById(user._id);
    expect(refreshedUser.name).toBe('John Galt');
  });

  test('It should be able to recover a password', async () => {
    let response;
    let result;
    let error;
    const [user] = await createTestUserWithSession('john');
    const { email } = user;
    const oldHash = user.hash;

    // Obtain token
    response = await request(app)
      .post('/password/forgot')
      .send({ email });
    ({ result, error } = response.body);
    expect(error).toBe(undefined);
    const { resetPasswordToken } = result;
    expect(resetPasswordToken.length).toBe(64);

    // Use token
    const newPassword = 'hello';
    response = await request(app)
      .post('/password/reset')
      .send({ email, resetPasswordToken, newPassword });
    ({ result, error } = response.body);
    expect(error).toBe(undefined);
    expect(result.success).toBe(true);
    const refreshedUser = await User.findById(user._id);
    expect(refreshedUser.hash !== oldHash).toBe(true);
  });
});
