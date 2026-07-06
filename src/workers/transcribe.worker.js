const { Worker } = require("bullmq");
const redis = require("../config/redis");

const worker = new Worker(
    "transcribe",
    async (job) => {
        console.log("Processing job:", job.data);

        // simulate AI processing
        await new Promise((r) => setTimeout(r, 3000));

        console.log("Done job:", job.data.jobId);
    },
    {
        connection: redis
    }
);

worker.on("completed", (job) => {
    console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, err) => {
    console.error(`Job failed: ${job.id}`, err.message);
});

console.log("Worker started...");