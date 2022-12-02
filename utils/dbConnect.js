import mongoose from "mongoose";

const DB_URI = process.env.NEXT_PUBLIC_DB_URI;
if (!DB_URI) {
    throw new Error(
        "Please define the DB_URI environment variable inside .env.local"
    );
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null};
}

const dbConnect = async () => {
    if (cached.conn) {
        return cached.conn;
    };

    if (!cached.promise) {
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
        cached.promise = mongoose.connect(DB_URI, options).then((mongoose) => {
            return mongoose;
        })
    };

    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;