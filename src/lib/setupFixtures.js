
import nodeEnvConfiguration from 'node-env-configuration';
import { signup } from './users';
import configDefaults from '../../config/defaults.json';
import User from '../models/user';

const config = nodeEnvConfiguration({
  defaults: configDefaults,
  prefix: 'api',
});

const createUsers = async () => {
  const { admin } = config;
  const params = Object.assign({}, admin, { passwordRepeat: admin.password });
  if (await User.findOne({ email: params.email })) {
    return false;
  }
  const adminUser = await signup(params);
  adminUser.role = 'admin';
  await adminUser.save();
  console.log(`Added admin user ${adminUser.email} to database`);
  return true;
};

export default async () => {
  await createUsers();
};
