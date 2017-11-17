
import { Router } from 'express';
import {
  fetchSession,
  requireUser
} from '../middleware/users'
import User from '../models/user'

export default ({ config, db }) => {
  let controller = Router();

  controller.use(fetchSession)

  controller.get('/', requireUser('admin'), async (req, res) => {
    const users = await User.find()
    res.json({result: users})
  });

  return controller;
}
