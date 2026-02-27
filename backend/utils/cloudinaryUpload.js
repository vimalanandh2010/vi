const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload a file to Cloudinary
 * @param {Object} file - Multer file object
 * @param {String} folder - Folder name in Cloudinary (e.g., 'resumes', 'photos')
 * @returns {Promise<String>} - Public URL of uploaded file
 */
const uploadToCloudinary = async (file, folder) => {
    try {
        if (!file || !file.buffer) {
            throw new Error('No file buffer provided');
        }

        console.log(`📡 Uploading to Cloudinary: ${folder}/${file.originalname}`);

        // Determine resource type based on file type
        let resourceType = 'auto';
        if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
            resourceType = 'raw'; // Use 'raw' for PDFs
        } else if (file.mimetype.startsWith('image/')) {
            resourceType = 'image';
        } else if (file.mimetype.startsWith('video/')) {
            resourceType = 'video';
        }

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: folder,
                    resource_type: resourceType,
                    public_id: `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`,
                    // Add flags for better PDF handling
                    flags: resourceType === 'raw' ? 'attachment' : undefined
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary Upload Error:', error);
                        reject(error);
                    } else {
                        // For raw files (PDFs), construct a URL that forces download/proper viewing
                        let finalUrl = result.secure_url;
                        
                        // If it's a PDF, modify the URL to use fl_attachment for proper viewing
                        if (resourceType === 'raw' && file.mimetype === 'application/pdf') {
                            // Cloudinary raw URLs: https://res.cloudinary.com/{cloud}/raw/upload/{path}
                            // We want to ensure it's viewable in browser
                            finalUrl = result.secure_url;
                        }
                        
                        console.log('✅ Cloudinary upload successful:', finalUrl);
                        resolve(finalUrl);
                    }
                }
            );

            uploadStream.end(file.buffer);
        });

    } catch (error) {
        console.error('❌ Cloudinary upload failed:', error.message);
        return null;
    }
};

/**
 * Delete a file from Cloudinary
 * @param {String} fileUrl - Public URL of the file to delete
 * @returns {Promise<Boolean>} - Success status
 */
const deleteFromCloudinary = async (fileUrl) => {
    try {
        if (!fileUrl) return false;

        // Extract public_id from Cloudinary URL
        // Example: https://res.cloudinary.com/dwkzum93b/image/upload/v1234567890/resumes/file.pdf
        const urlParts = fileUrl.split('/upload/');
        if (urlParts.length < 2) {
            console.error('❌ Invalid Cloudinary URL for deletion');
            return false;
        }

        const pathParts = urlParts[1].split('/');
        pathParts.shift(); // Remove version (v1234567890)
        const publicId = pathParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension

        const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });

        if (result.result === 'ok') {
            console.log(`✅ File deleted from Cloudinary: ${publicId}`);
            return true;
        } else {
            console.error('❌ Cloudinary Delete Error:', result);
            return false;
        }

    } catch (error) {
        console.error('❌ Cloudinary delete failed:', error.message);
        return false;
    }
};

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary
};
