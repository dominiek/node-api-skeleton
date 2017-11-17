
import mongoose from 'mongoose';

export const setupMongooseDb = (done) => {
  mongoose.connect('mongodb://localhost/skeleton_test', {useMongoClient: true});
	mongoose.connection.once('open', () => {
    done()
	});
}

export const teardownMongooseDb = (done) => {
  mongoose.connection.close()
}
