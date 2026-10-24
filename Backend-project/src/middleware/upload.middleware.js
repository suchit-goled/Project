import multer from "multer";
import AppError from "../utils/AppError.js";

const storage = multer.memoryStorage();

const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif"
];

const fileFilter = (req, file, cb) => {
    if (file && allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new AppError("Only image files (JPEG, PNG, WebP, GIF, AVIF) are allowed.", 400), false);
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 1
    },
    fileFilter
});

export default upload;
