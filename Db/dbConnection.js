const { connect } = require("mongoose");

const DB_URI = process.env.DB_URI

let cached = global.mongoose

if (!cached) {
    cached = global.mongoose = { conn: null, prom: null }
}

const databaseConnection = async () => {

    if (cached.conn) return cached.conn;
    if (!cached.promise) {
        cached.promise = connect(DB_URI);
    }
    try {
        cached.conn = await cached.promise;
        console.log(`New MongoDB Connected! DB Host: ${cached.conn.connection.host}`)
        return cached.conn

    }
    catch (err) {
        console.error(err)
        throw err
    }

}

// Optional: Handle connection errors at the application level
const handleDatabaseConnectionError = (error) => {
    // Log the MongoDB connection error
    console.error("MongoDB connection error:", error);

    // Check for specific error types and log additional information
    if (error.name === "MongoNetworkError") {
        console.error("Network error. Check your connection.");
    }

    // Exit the process if there is a critical error
    // process.exit(1);
};

module.exports = { databaseConnection, handleDatabaseConnectionError };
