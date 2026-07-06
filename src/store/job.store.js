const jobs = new Map();

function setJob(jobId, data) {
    jobs.set(jobId, data);
}

function getJob(jobId) {
    return jobs.get(jobId);
}

function updateJob(jobId, data) {
    const old = jobs.get(jobId) || {};
    jobs.set(jobId, { ...old, ...data });
}

module.exports = {
    setJob,
    getJob,
    updateJob
};