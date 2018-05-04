const mongoose = require('mongoose');
const config = require('config');
const Mockgoose = require('mockgoose').Mockgoose;
const mockgoose = new Mockgoose(mongoose);

exports.context = require('./context');
exports.request = require('./request');

exports.setupDb = () =>
  new Promise((resolve, reject) => {
    mockgoose.prepareStorage().then(function() {
      mongoose.connect(config.get('mongo.uri'), function(err) {
        if (err) return reject(err);
        resolve(err);
      });
    });
  });

exports.resetDb = () => mockgoose.helper.reset();

exports.teardownDb = async () => {
  await mockgoose.helper.reset();
  await mongoose.disconnect();

  // https://github.com/Mockgoose/Mockgoose/pull/72
  const promise = new Promise((resolve) => {
    mockgoose.mongodHelper.mongoBin.childProcess.on('exit', resolve);
  });
  mockgoose.mongodHelper.mongoBin.childProcess.kill('SIGTERM');
  return promise;
};
