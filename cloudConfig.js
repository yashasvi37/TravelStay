const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const logger = require('./utils/logger');

// Configure Cloudinary — uses envalid-validated env var names
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

logger.info('✅ Cloudinary configured successfully');

// Create Cloudinary storage for multer
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "TravelStay_Listings",
        allowed_formats: ["png", "jpg", "jpeg", "gif", "webp"],
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return file.fieldname + '-' + uniqueSuffix;
        },
        // ⚡️ Do not apply heavy transformations on upload, apply them on delivery URL
    }
});

logger.info('✅ Cloudinary storage configured successfully');

module.exports = { cloudinary, storage };
