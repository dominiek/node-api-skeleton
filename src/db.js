
import mongoose from 'mongoose';

export default ({ config }) => new Promise((resolve) => {
  // connect to a database if needed, then pass it to `callback`:
  mongoose.connect(config.mongo.uri, { useMongoClient: true });
  mongoose.connection.once('open', () => {
    resolve(mongoose.connection);
  });
});
