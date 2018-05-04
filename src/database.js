const config = require('config');
const mongoose = require('mongoose');

mongoose.Promise = Promise;
if (config.get('mongo.debug', false)) {
  mongoose.set('debug', true);
}

module.exports = async () => {
  await mongoose.connect(config.get('mongo.uri'), config.get('mongo.options'));
  const db = mongoose.connection;
  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    console.log('mongodb connected');
  });
  return db;
};
