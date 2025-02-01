import mongoose from 'mongoose';

const uri = 'mongodb://127.0.0.1:27017/integratedproject';

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection;

  db.on('connected', () => {
    console.log('Connected to MongoDB successfully');
  });
  
  db.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });
  
  db.on('disconnected', () => {
    console.log('Disconnected from MongoDB');
  });
  
  export { db };