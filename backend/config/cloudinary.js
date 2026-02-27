const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const isVideo = file.mimetype.startsWith('video');
        return {
            folder: isVideo ? 'course_videos' : 'course_thumbnails',
            allowed_formats: isVideo ? ['mp4', 'mkv', 'mov', 'avi'] : ['jpg', 'png', 'jpeg'],
            resource_type: isVideo ? 'video' : 'image',
            public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
            transformation: [
                { quality: 'auto', fetch_format: 'auto' }
            ]
        };

    }
});

module.exports = { cloudinary, storage };
