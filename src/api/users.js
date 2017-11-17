
import { Router } from 'express';
import asyncWrap from 'express-async-wrapper'
import {
  fetchSession,
  requireUser
} from '../middleware/users'
import {
  signup,
  authenticate,
  encodeSession
} from '../lib/users'
import User from '../models/user'

export default ({ config, db }) => {
  let api = Router();

  api.use(fetchSession)

  // Create user (signup)
  api.post('/', asyncWrap(async (req, res, next) => {
    const user = await signup(req.body)
    res.json({result: user})
  }));

  // Create session (login)
  api.post('/sessions', asyncWrap(async (req, res) => {
    const user = await authenticate(req.body.email, req.body.password)
    const token = encodeSession(user._id)
    res.json({result: {user, token}})
  }));

  // Get self (user info)
  api.get('/self', requireUser(), (req, res) => {
    res.json({result: req.user})
  });

  // Update self (user profile)
  api.post('/self', requireUser(), asyncWrap(async (req, res) => {
    ['name'].forEach(validField => {
      if (req.body[validField]) {
        req.user[validField] = req.body[validField]
      }
    })
    await req.user.save()
    res.json({result: req.user})
  }));

  // Delete self (user profile)
  api.delete('/self', requireUser(), asyncWrap(async (req, res) => {
    await req.user.remove()
    res.json({result: {success: true}})
  }));

  // Admin list users
  api.get('/', requireUser('admin'), asyncWrap(async (req, res) => {
    const users = await User.find()
    res.json({result: users})
  }));

  // Admin list users
  api.get('/', requireUser('admin'), asyncWrap(async (req, res) => {
    const users = await User.find()
    res.json({result: users})
  }));

  // Admin get user
  api.get('/:id', requireUser('admin'), asyncWrap(async (req, res) => {
    const user = await User.findById(req.params.id)
    res.json({result: user})
  }));

  // Admin delete user
  api.delete('/:id', requireUser('admin'), asyncWrap(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) return next(new Error('No such user'))
    await user.remove()
    res.json({result: {success: true}})
  }));

  // Admin update user
  api.post('/:id', requireUser('admin'), asyncWrap(async (req, res, next) => {
    const user = await User.findById(req.params.id)
    if (!user) return next(new Error('No such user'))
    user.set(req.body)
    await user.save()
    res.json({result: user})
  }));

  return api;
}
