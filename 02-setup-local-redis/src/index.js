import express from "express";
import Redis from "ioredis";
import mongoose from "mongoose";

// Create an Express application
const app = express();

// Create a Redis client
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");

app.get("/redis", async (req, res) => {
    // Test Redis connection
    const reply = await redis.ping();
    res.json({
        redis: reply,
    });
});


app.get("/mongo", async (req, res) => {
    // Test MongoDB connection
    const url = process.env.MONGO_URL || "mongodb://localhost:27017/chai_aur_redis";

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(url);
    }

    res.json({
        mongo: "connected",
        database: mongoose.connection.name,
    })
})

app.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});