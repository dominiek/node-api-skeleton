/* eslint no-underscore-dangle: ["error", { "allow": ["_id"] }] */

import { Router } from 'express';
import asyncWrap from 'express-async-wrapper';
import {
  fetchSession,
  requireUser,
} from '../middleware/users';
import {
  signup,
  authenticate,
  encodeSession,
  exportSafeUser,
} from '../lib/users';
import User from '../models/user';

export default () => {
  const api = Router();

  api.use(fetchSession);

  // Create user (signup)
  api.post('/', asyncWrap(async (req, res) => {
    const rawUser = await signup(req.body);
    const user = exportSafeUser(rawUser);
    res.json({ result: user });
  }));

  // Create session (login)
  api.post('/sessions', asyncWrap(async (req, res) => {
    const rawUser = await authenticate(req.body.email, req.body.password);
    const token = encodeSession(rawUser._id);
    const user = exportSafeUser(rawUser);
    res.json({ result: { user, token } });
  }));

  // Get self (user info)
  api.get('/self', requireUser(), (req, res) => {
    const user = exportSafeUser(req.user);
    res.json({ result: user });
  });

  // Update self (user profile)
  api.post('/self', requireUser(), asyncWrap(async (req, res) => {
    ['name'].forEach((validField) => {
      if (req.body[validField]) {
        req.user[validField] = req.body[validField];
      }
    });
    await req.user.save();
    const user = exportSafeUser(req.user);
    res.json({ result: user });
  }));

  // Delete self (user profile)
  api.delete('/self', requireUser(), asyncWrap(async (req, res) => {
    await req.user.remove();
    res.json({ result: { success: true } });
  }));

  // Admin list users
  api.get('/', requireUser('admin'), asyncWrap(async (req, res) => {
    const rawUsers = await User.find();
    const users = rawUsers.map(user => exportSafeUser(user));
    res.json({ result: users });
  }));

  // Admin get user
  api.get('/:id', requireUser('admin'), asyncWrap(async (req, res) => {
    const rawUser = await User.findById(req.params.id);
    const user = exportSafeUser(rawUser);
    res.json({ result: user });
  }));

  // Admin delete user
  api.delete('/:id', requireUser('admin'), asyncWrap(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    if (!user) return next(new Error('No such user'));
    await user.remove();
    return res.json({ result: { success: true } });
  }));

  // Admin update user
  api.post('/:id', requireUser('admin'), asyncWrap(async (req, res, next) => {
    const rawUser = await User.findById(req.params.id);
    if (!rawUser) return next(new Error('No such user'));
    rawUser.set(req.body);
    await rawUser.save();
    const user = exportSafeUser(rawUser);
    return res.json({ result: user });
  }));

  return api;
};
