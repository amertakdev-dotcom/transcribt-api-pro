const { Queue } = require("bullmq");
const redis = require("../config/redis");

const transcribeQueue = new Queue("transcribe", {
    connection: redis
});

module.exports = transcribeQueue;