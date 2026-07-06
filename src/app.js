const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");

const uploadRoute = require("./routes/upload.route");
const statusRoute = require("./routes/status.route");

const app = express();

/**
 * =====================
 * CORE MIDDLEWARE
 * =====================
 */
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * =====================
 * SERVE STATIC FRONTEND
 * =====================
 */
app.use(express.static(path.join(__dirname, "..", "public")));

/**
 * =====================
 * API ROUTES
 * =====================
 */
app.use("/api", uploadRoute);
app.use("/api/status", statusRoute);

/**
 * =====================
 * 404 HANDLER (LAST ONLY)
 * =====================
 */
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
        path: req.originalUrl
    });
});

module.exports = app;
