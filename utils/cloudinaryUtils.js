const { cloudinary } = require('../cloudConfig');

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        if (publicId && publicId.includes('cloudinary')) {
            // Extract public ID from URL
            const urlParts = publicId.split('/');
            const filename = urlParts[urlParts.length - 1].split('.')[0];
            const folder = urlParts[urlParts.length - 2];
            const fullPublicId = `${folder}/${filename}`;
            
            const result = await cloudinary.uploader.destroy(fullPublicId);
            console.log(`✅ Image deleted from Cloudinary: ${fullPublicId}`);
            return result;
        }
    } catch (error) {
        console.error('❌ Error deleting image from Cloudinary:', error);
        throw error;
    }
};

// Generate optimized image URL
const getOptimizedImageUrl = (originalUrl, options = {}) => {
    if (!originalUrl || !originalUrl.includes('cloudinary')) {
        return originalUrl;
    }

    const {
        width = 800,
        height = 600,
        crop = 'limit',
        quality = 'auto:good',
        format = 'auto'
    } = options;

    // Parse the Cloudinary URL and add transformations
    const baseUrl = originalUrl.split('/upload/')[0] + '/upload/';
    const imagePath = originalUrl.split('/upload/')[1];
    
    const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
    
    return `${baseUrl}${transformations}/${imagePath}`;
};

module.exports = {
    deleteImage,
    getOptimizedImageUrl
};
