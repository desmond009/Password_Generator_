import mongoose from "mongoose";

let isConnected = 0 as 0 | 1;

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose;
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not set");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGODB_DB || undefined,
  });

  isConnected = 1;
  return mongoose;
}


