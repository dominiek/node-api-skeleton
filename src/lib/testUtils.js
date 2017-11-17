
import mongoose from 'mongoose';

export const setupMongooseDb = () => {
  new Promise((resolve, reject) => {
    mongoose.connect('mongodb://localhost/skeleton_test', {useMongoClient: true});
    mongoose.connection.once('open', () => {
      resolve()
    });
  })
}

export const teardownMongooseDb = () => {
  return new Promise((resolve, reject) => {
    mongoose.connection.close()
    resolve()
  })
}
