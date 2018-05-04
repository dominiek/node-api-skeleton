const User = require('../src/models/user');
const config = require('config');

const adminConfig = config.get('admin');

const createUsers = async () => {
  if (await User.findOne({ email: adminConfig.email })) {
    return false;
  }
  const adminUser = await User.create(adminConfig);
  console.log(`Added admin user ${adminUser.email} to database`);
  return true;
};

module.exports = createUsers;
