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
        },

        // Translation fields
        targetLanguage: {
            type: String,
            default: null
        },

        translatedResult: {
            type: String,
            default: null
        },

        translationStatus: {
            type: String,
            enum: ["none", "translating", "done", "failed"],
            default: "none"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Job", jobSchema);