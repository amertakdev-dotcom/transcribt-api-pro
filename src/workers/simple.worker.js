const Job = require("../models/job.model");
const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");

/**
 * Call Python AI service to transcribe audio
 */
async function callAIService(filePath) {
    const aiUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";

    const form = new FormData();
    form.append("file", fs.createReadStream(filePath), {
        filename: path.basename(filePath)
    });

    const response = await axios.post(`${aiUrl}/transcribe`, form, {
        headers: {
            ...form.getHeaders(),
            // Remove content-type so axios sets it with boundary
        },
        timeout: 300000 // 5 minutes for long audio
    });

    return response.data;
}

/**
 * Process a single job
 */
async function processJob(job) {
    console.log("▶ Processing:", job.jobId, "| File:", job.filePath);

    // Mark as processing
    job.status = "processing";
    await job.save();

    try {
        // Check if file exists
        if (!(await fs.pathExists(job.filePath))) {
            throw new Error(`File not found: ${job.filePath}`);
        }

        // Call AI service
        const result = await callAIService(job.filePath);

        // Save result
        job.status = "done";
        job.result = result.text;
        job.language = result.language || null;
        await job.save();

        console.log("✔ Done:", job.jobId, "| Language:", result.language);

        // Cleanup uploaded file
        try {
            await fs.remove(job.filePath);
        } catch (e) {
            // ignore cleanup errors
        }

    } catch (err) {
        console.error("✖ Failed:", job.jobId, "| Error:", err.message);

        job.status = "failed";
        job.result = null;
        await job.save();
    }
}

/**
 * Worker loop — polls MongoDB for queued jobs
 */
function startWorker() {
    const interval = parseInt(process.env.WORKER_POLL_INTERVAL || "3000", 10);

    console.log(`🚀 Mongo Worker started... (poll every ${interval}ms)`);

    setInterval(async () => {
        try {
            const job = await Job.findOne({ status: "queued" });

            if (!job) return;

            await processJob(job);

        } catch (err) {
            console.error("Worker error:", err.message);
        }
    }, interval);
}

module.exports = { startWorker };