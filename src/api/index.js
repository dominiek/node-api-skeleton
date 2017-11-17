import { version } from '../../package.json';
import { Router } from 'express';
import facets from './facets';
import users from './users';

export default ({ config, db }) => {
	let api = Router();

	api.use('/1/facets', facets({ config, db }));
	api.use('/1/users', facets({ config, db }));

	// perhaps expose some API metadata at the root
	api.get('/', (req, res) => {
		const protocolVersion = 1
		res.json({ version, protocolVersion });
	});

	return api;
}
