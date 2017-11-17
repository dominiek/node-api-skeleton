
import { Router } from 'express';
import users from './users';
import { version } from '../../package.json';

export default ({ config, db }) => {
  const api = Router();

  api.use('/1/users', users({ config, db }));

  api.get('/', (req, res) => {
    const protocolVersion = 1;
    res.json({ version, protocolVersion });
  });

  return api;
};
