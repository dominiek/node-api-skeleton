
import { setupMongooseDb, teardownMongooseDb } from '../../lib/testUtils';
import User from '../user';

beforeAll(async () => {
  await setupMongooseDb();
  await User.remove();
});

afterAll(teardownMongooseDb);

describe('User', () => {
  test('It should be able to CRUD a user', async () => {
    const user = new User({ email: 'info@me.com', username: 'dominiek' });
    await user.save();
    const results = await User.find({ email: 'info@me.com' });
    expect(results.length).toBe(1);
    const savedUser = results[0];
    expect(savedUser.createdAt > 1);
  });
});
