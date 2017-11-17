
import mongoose from 'mongoose';

export default () => new Promise((resolve) => {
  // connect to a database if needed, then pass it to `callback`:
  mongoose.connect('mongodb://localhost/skeleton_development', { useMongoClient: true });
  mongoose.connection.once('open', () => {
    resolve(mongoose.connection);
  });
});
