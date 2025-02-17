import mongoose from 'mongoose';

const uri = 'mongodb+srv://jrpolyeeakshay:1JYxp7RT6waa0V64@wingwise.k5cyo.mongodb.net/?retryWrites=true&w=majority&appName=wingwise';

const connectDB = async () => {
  console.log('Connecting to DB');
  mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
      .then(() => console.log('Connected Successfully'))
      .catch((err) => console.error('Not Connected'));
}
  export { connectDB };