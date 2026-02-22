import mongoose from 'mongoose';

export async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tactics-lab-fc';

  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');
}
