/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import mongoose from 'mongoose';
import { signup, encodeSession } from './users';

export const setupMongooseDb = () => new Promise((resolve) => {
  mongoose.connect('mongodb://localhost/skeleton_test', { useMongoClient: true });
  mongoose.connection.once('open', () => {
    resolve();
  });
});

export const teardownMongooseDb = () => new Promise((resolve) => {
  mongoose.connection.close();
  resolve();
});

export const createTestUserWithSession = async (id, role = 'user') => {
  const user = await signup({
    username: id,
    email: `${id}@me.com`,
    password: 'password',
    passwordRepeat: 'password',
  });
  user.role = role;
  await user.save();
  return [user, encodeSession(user._id)];
};

export const generateSessionHeader = token => ['Authorization', `Bearer ${token}`];
