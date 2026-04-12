const multer = require('multer');

const storage = multer.memoryStorage();

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error('Invalid file type. Allowed: JPEG, PNG, WebP, PDF');
        error.statusCode = 400;
        cb(error, false);
    }
};

const uploadConfig = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
});

const uploadSingle = uploadConfig.single('file');

const imageOnlyFilter = (req, file, cb) => {
    if (IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        const error = new Error('Invalid file type. Allowed: JPEG, PNG, WebP');
        error.statusCode = 400;
        cb(error, false);
    }
};

const imageOnlyConfig = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: imageOnlyFilter
});

const uploadImageOnly = imageOnlyConfig.single('file');

module.exports = {
    uploadSingle,
    uploadImageOnly
};