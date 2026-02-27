const { bucket } = require('../config/firebaseConfig');
const path = require('path');

/**
 * Upload a file to Firebase Storage
 * @param {Object} file - Multer file object (with buffer from memory storage)
 * @param {String} folder - Folder name in storage (e.g., 'resumes', 'photos')
 * @returns {Promise<String>} - Public URL of uploaded file
 */
const uploadToFirebase = async (file, folder) => {
    try {
        if (!file || !file.buffer) {
            throw new Error('No file buffer provided');
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${folder}/${timestamp}-${sanitizedOriginalName}`;

        // Reference to the file in Firebase Storage
        const fileUpload = bucket.file(filename);

        // Upload the file buffer
        await fileUpload.save(file.buffer, {
            metadata: {
                contentType: file.mimetype,
                metadata: {
                    firebaseStorageDownloadTokens: timestamp // Enables public access
                }
            },
            public: true,
            validation: 'md5'
        });

        // Make the file publicly accessible
        await fileUpload.makePublic();

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filename}`;

        console.log(`✅ File uploaded to Firebase: ${publicUrl}`);
        return publicUrl;

    } catch (error) {
        console.error('❌ Firebase upload error:', error.message);
        throw new Error(`Firebase upload failed: ${error.message}`);
    }
};

/**
 * Delete a file from Firebase Storage
 * @param {String} fileUrl - Public URL of the file to delete
 * @returns {Promise<Boolean>} - Success status
 */
const deleteFromFirebase = async (fileUrl) => {
    try {
        if (!fileUrl) return false;

        // Extract filename from URL
        const urlParts = fileUrl.split(`${bucket.name}/`);
        if (urlParts.length < 2) {
            throw new Error('Invalid Firebase URL');
        }

        const filename = urlParts[1];
        const file = bucket.file(filename);

        await file.delete();
        console.log(`✅ File deleted from Firebase: ${filename}`);
        return true;

    } catch (error) {
        console.error('❌ Firebase delete error:', error.message);
        return false;
    }
};

module.exports = {
    uploadToFirebase,
    deleteFromFirebase
};
