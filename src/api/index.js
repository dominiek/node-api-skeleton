import { version } from '../../package.json';
import { Router } from 'express';
import users from './users';

export default ({ config, db }) => {
  let api = Router();

  api.use('/1/users', users({ config, db }));

  // perhaps expose some API metadata at the root
  api.get('/', (req, res) => {
    const protocolVersion = 1
    res.json({ version, protocolVersion });
  });

  return api;
}
