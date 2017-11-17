
import { setupMongooseDb, teardownMongooseDb } from '../../lib/testUtils';
import User from '../../models/user';
import {
  signup,
  authenticate,
  encodeSession,
  decodeSession,
  hasRole,
  requireRole,
  exportSafeUser,
} from '../users';

beforeAll(async () => {
  await setupMongooseDb();
});

beforeEach(async () => {
  await User.remove();
});

afterAll(teardownMongooseDb);

describe('Users', () => {
  test('It should be able to sign up a user with validation', async () => {
    expect.assertions(5);

    await signup({}).catch((e) => {
      expect(e.message).toMatch('password to not be blank');
    });

    await signup({
      password: 'hello',
    }).catch((e) => {
      expect(e.message).toMatch('passwords to match');
    });

    await signup({
      password: 'hello',
      passwordRepeat: 'hello',
      username: 'dominiek',
    }).catch((e) => {
      expect(e.message).toMatch('email');
    });

    const user = await signup({
      password: 'hello',
      passwordRepeat: 'hello',
      username: 'dominiek',
      email: 'info@dominiek.com',
    });
    expect(!user.password);
    expect(user.hash.length).toBe(60);

    await signup({
      password: 'hello',
      passwordRepeat: 'hello',
      username: 'dominiek',
      email: 'info@dominiek.com',
    }).catch((e) => {
      expect(e.message).toMatch('already');
    });
  });

  test('It should authenticate properly', async () => {
    expect.assertions(6);

    await signup({
      password: 'hello',
      passwordRepeat: 'hello',
      username: 'dominiek',
      email: 'info@dominiek.com',
    });

    await authenticate('info@dominiek.com', null).catch((e) => {
      expect(e.message).toMatch('Password cannot be blank');
    });

    await authenticate('info@dominiek.com', '').catch((e) => {
      expect(e.message).toMatch('Password cannot be blank');
    });

    await authenticate('', 'sth').catch((e) => {
      expect(e.message).toMatch('Email cannot be blank');
    });

    await authenticate('info@dominiek.com', 'sth').catch((e) => {
      expect(e.message).toMatch('Incorrect email or password');
    });

    await authenticate('info@dominiek.co', 'hello').catch((e) => {
      expect(e.message).toMatch('Incorrect email or password');
    });

    const result = await authenticate('info@dominiek.com', 'hello');
    expect(result.email).toBe('info@dominiek.com');
  });

  test('It should be able to check a role', () => {
    expect(hasRole({ role: 'user' }, 'admin')).toBe(false);
    expect(hasRole({ role: 'admin' }, 'admin')).toBe(true);
    expect(() => requireRole({ role: 'user' }, 'admin')).toThrow('Permission denied');
  });

  test('It should be able to encode and decode a session', () => {
    const userId = 999;
    const badToken = 'bla';
    const goodToken = encodeSession(userId);
    expect(goodToken.length).toBe(123);
    expect(decodeSession(goodToken)).toBe(userId);
    expect(() => decodeSession(badToken)).toThrow('jwt malformed');
  });

  test('It should convert a user to a safe user object without password hash', async () => {
    const user = await signup({
      password: 'hello',
      passwordRepeat: 'hello',
      username: 'dominiek',
      email: 'info@dominiek.com',
    });
    expect(user.hash.length).toBe(60);
    expect(!!exportSafeUser(user).hash).toBe(false);
  });
});
