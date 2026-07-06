const express = require("express");
const router = express.Router();

const Job = require("../models/job.model");

/**
 * GET /api/status/:jobId
 */
router.get("/:jobId", async (req, res) => {
    try {
        const { jobId } = req.params;

        const job = await Job.findOne({ jobId });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
                jobId
            });
        }

        return res.json({
            success: true,
            job
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
});

module.exports = router;