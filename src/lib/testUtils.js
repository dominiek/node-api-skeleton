
import mongoose from 'mongoose';
import { signup, encodeSession } from './users'
import request from 'supertest'

export const setupMongooseDb = () => {
  new Promise((resolve, reject) => {
    mongoose.connect('mongodb://localhost/skeleton_test', {useMongoClient: true});
    mongoose.connection.once('open', () => {
      resolve()
    });
  })
}

export const teardownMongooseDb = () => {
  return new Promise((resolve, reject) => {
    mongoose.connection.close()
    resolve()
  })
}

export const createTestUserWithSession = async (id, role='user') => {
  const user = await signup({
    username: id,
    email: id + '@me.com',
    password: 'password',
    passwordRepeat: 'password'
  })
  user.role = role
  await user.save()
  return [user, encodeSession(user['_id'])]
}

export const generateSessionHeader = (token) => {
  return ['Authorization', `Bearer ${token}`]
}
