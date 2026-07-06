const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        jobId: {
            type: String,
            required: true,
            unique: true
        },

        filePath: String,
        fileName: String,
        originalName: String,
        size: Number,

        status: {
            type: String,
            enum: ["queued", "processing", "done", "failed"],
            default: "queued"
        },

        result: {
            type: String,
            default: null
        },

        language: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Job", jobSchema);