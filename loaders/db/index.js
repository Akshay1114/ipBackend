import mongoose from 'mongoose';

const uri = 'mongodb://127.0.0.1:27017/integratedproject';

const connectDB = async () => {
  mongoose
      .connect(uri, {
          useCreateIndex: true,
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useFindAndModify: false
      })
      .then(() => console.log('Connected Successfully'))
      .catch((err) => console.error('Not Connected'));
}
  export { connectDB };