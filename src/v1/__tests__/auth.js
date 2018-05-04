const jwt = require('jsonwebtoken');

const User = require('../../models/User');
const tokens = require('../../lib/tokens');
const emails = require('../../lib/emails');

const { initialize: initializeEmails } = require('../../lib/emails');

const { setupDb, teardownDb, request } = require('../../test-helpers');

jest.mock('../../lib/emails');

beforeAll(async () => {
  await initializeEmails();
  await setupDb();
});

afterAll(async () => {
  await teardownDb();
});

describe('/1/users', () => {
  describe('POST login', () => {
    it('should log in a user in', async () => {
      const password = '123password!';
      const user = await User.create({
        email: 'foo@bar.com',
        password,
        name: 'test'
      });

      const response = await request('POST', '/1/auth/login', { email: user.email, password });
      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');
    });
  });

  describe('POST /apply', () => {
    it('should send a welcome email', async () => {
      const email = 'some@email.com';
      const response = await request('POST', '/1/auth/apply', { email });
      expect(response.status).toBe(204);
      expect(emails.sendWelcome).toHaveBeenCalledTimes(1);
      expect(emails.sendWelcome).toBeCalledWith(
        expect.objectContaining({
          to: email,
          token: expect.any(String)
        })
      );
    });

    it('should handle if user already signup', async () => {
      const user = await User.create({
        email: 'someemail@bar.com',
        password: 'password1',
        name: 'test'
      });
      const response = await request('POST', '/1/auth/apply', { email: user.email });
      expect(response.status).toBe(204);
      expect(emails.sendWelcomeKnown).toHaveBeenCalledTimes(1);
      expect(emails.sendWelcomeKnown).toBeCalledWith(
        expect.objectContaining({
          to: user.email,
          name: user.name
        })
      );
    });
  });

  describe('POST /register', () => {
    it('should create the user', async () => {
      const email = 'nao@bau.com';
      const token = tokens.createUserTemporaryToken({ email }, 'user:register');

      const response = await request('POST', '/1/auth/register', {
        token,
        name: 'somename',
        password: 'new-p$assword-12'
      });
      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');

      const updatedUser = await User.findOne({
        email
      });

      expect(updatedUser.name).toBe('somename');
    });

    it('should fail if the user already exists', async () => {
      const user = await User.create({
        email: 'boboa@bar.com',
        password: 'password1',
        name: 'test'
      });
      const token = tokens.createUserTemporaryToken({ email: user.email }, 'user:register');
      const response = await request('POST', '/1/auth/register', {
        token,
        name: 'somename',
        password: 'new-p$assword-12'
      });
      expect(response.status).toBe(409);
    });
  });

  describe('POST /request-password', async () => {
    it('it should send an email to the registered user', async () => {
      const user = await User.create({
        email: 'foob1@bar.com',
        password: 'password1',
        name: 'test'
      });
      const response = await request('POST', '/1/auth/request-password', {
        email: user.email
      });
      expect(response.status).toBe(204);
      expect(emails.sendResetPassword).toHaveBeenCalledTimes(1);
      expect(emails.sendResetPassword).toBeCalledWith(
        expect.objectContaining({
          to: 'foob1@bar.com',
          token: expect.any(String)
        })
      );
    });

    it('it should send an email to the unknown user', async () => {
      const email = 'email@email.com';
      const response = await request('POST', '/1/auth/request-password', {
        email
      });
      expect(response.status).toBe(204);
      expect(emails.sendResetPasswordUnknown).toHaveBeenCalledTimes(1);
      expect(emails.sendResetPasswordUnknown).toBeCalledWith(
        expect.objectContaining({
          to: email
        })
      );
    });
  });

  describe('POST /set-password', async () => {
    it('it should allow a user to set a password', async () => {
      const user = await User.create({
        email: 'something@bo.com',
        name: 'something',
        password: 'oldpassword'
      });
      const password = 'very new password';
      const response = await request('POST', '/1/auth/set-password', {
        password,
        token: tokens.createUserTemporaryToken({ userId: user._id }, 'user:password')
      });
      expect(response.status).toBe(200);

      const { payload } = jwt.decode(response.body.data.token, { complete: true });
      expect(payload).toHaveProperty('kid', 'user');
      expect(payload).toHaveProperty('type', 'user');

      const updatedUser = await User.findById(user._id);
      expect(await updatedUser.verifyPassword(password)).toBe(true);
    });

    it('should handle invalid tokens', async () => {
      const password = 'very new password';
      const response = await request('POST', '/1/auth/set-password', {
        password,
        token: 'some bad token not really a good token'
      });
      expect(response.status).toBe(400);
      expect(response.body.error.message).toBe('bad jwt token');
    });
  });
});
