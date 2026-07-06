const Job = require("../models/job.model");

/**
 * Upload file → create job in MongoDB
 */
exports.upload = async (req, res) => {
    try {
        // ❌ validation
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        // jobId from middleware (or generate fallback)
        const jobId = req.jobId || Date.now().toString();

        // 🟢 CREATE JOB IN DATABASE
        const job = await Job.create({
            jobId: jobId,
            filePath: req.file.path,
            originalName: req.file.originalname,
            fileName: req.file.filename,
            size: req.file.size,
            status: "queued",
            result: null
        });

        // response
        return res.status(201).json({
            success: true,
            jobId: job.jobId,
            filename: job.fileName,
            originalName: job.originalName,
            size: job.size,
            status: job.status
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};