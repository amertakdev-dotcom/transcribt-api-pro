require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const { startWorker } = require("./workers/simple.worker");

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

/**
 * =====================
 * HEALTH CHECK ENDPOINT
 * =====================
 */
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        service: "transcribe-api-node",
        timestamp: new Date().toISOString()
    });
});

/**
 * =====================
 * START SERVER
 * =====================
 */
async function start() {
    // Connect to MongoDB
    if (process.env.MONGO_URL) {
        await connectDB();
    } else {
        console.warn("⚠ MONGO_URL not set — running without database");
    }

    // Start worker (MongoDB-based queue)
    if (process.env.MONGO_URL) {
        startWorker();
    }

    app.listen(PORT, HOST, () => {
        console.log("=================================");
        console.log(`🚀 Server running on http://${HOST}:${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
        console.log("=================================");
    });
}

start().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});