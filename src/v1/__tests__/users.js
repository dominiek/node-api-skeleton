const User = require('../../models/User');
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
  describe('GET /me', () => {
    it('it should return the logged in user', async () => {
      const user = await User.create({
        email: 'foo@bar.com',
        name: 'test',
        password: 'some1p%assword'
      });

      const response = await request('GET', '/1/users/me', {}, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(user.email);
    });
  });

  describe('PATCH /me', () => {
    it('it should allow updating the user', async () => {
      const user = await User.create({
        email: 'foo1@badr.com',
        name: 'test',
        password: 'some1p%assword'
      });

      const response = await request('PATCH', '/1/users/me', { name: 'other name' }, { user });
      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(user.email);
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.name).toBe('other name');
    });
  });
});
