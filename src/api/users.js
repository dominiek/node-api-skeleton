
import { Router } from 'express';
import User from '../models/user'

export default ({ config, db }) => {
	let controller = Router();

	controller.get('/', async (req, res) => {
		const users = await User.find()
		res.json({result: users})
	});

	return controller;
}
