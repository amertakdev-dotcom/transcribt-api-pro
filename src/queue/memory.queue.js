const queue = [];

function addJob(job) {
    queue.push(job);
}

function getJobs() {
    return queue;
}

function removeJob(jobId) {
    const index = queue.findIndex(j => j.jobId === jobId);
    if (index !== -1) queue.splice(index, 1);
}

module.exports = {
    addJob,
    getJobs,
    removeJob
};