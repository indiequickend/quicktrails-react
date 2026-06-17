import dns from "node:dns";
await dns.setServers(["8.8.8.8", "4.2.2.2"]);

import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

console.log("DNS Servers:", await dns.getServers());

// Reuse the connection across hot-reloads in dev and across serverless
// invocations on Vercel (which reuses the module cache between warm requests).
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function dbConnect() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = { serverApi: { version: "1", strict: true, deprecationErrors: true } };

    console.log("Attempting to connect to MongoDB Atlas...");

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("Successfully connected to MongoDB Atlas!");
      return mongoose;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;


