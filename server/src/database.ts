import mongoose from 'mongoose';

export async function connectDatabase(): Promise<boolean> {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/tactics-lab-fc';

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to MongoDB');
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.warn(`MongoDB unavailable (${message}). Using in-memory formation storage.`);
    return false;
  }
}
