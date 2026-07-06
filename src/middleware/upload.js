const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const { v4: uuid } = require("uuid");

const uploadDir = path.join(process.cwd(), "uploads");

fs.ensureDirSync(uploadDir);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const jobId = uuid();
        const ext = path.extname(file.originalname);

        req.jobId = jobId;

        cb(null, `${jobId}${ext}`);
    }
});

const allowed = [
    ".mp3",
    ".wav",
    ".m4a",
    ".mp4",
    ".aac",
    ".ogg"
];

const upload = multer({
    storage,

    limits: {
        fileSize: 1024 * 1024 * 500 // 500MB
    },

    fileFilter(req, file, cb) {

        const ext = path.extname(file.originalname).toLowerCase();

        if (!allowed.includes(ext)) {
            return cb(new Error("Unsupported file type"));
        }

        cb(null, true);
    }
});

module.exports = upload;