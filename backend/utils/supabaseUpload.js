const supabase = require('../config/supabaseConfig');

/**
 * Upload a file to Supabase Storage
 * @param {Object} file - Multer file object
 * @param {String} folder - Folder name in storage (e.g., 'resumes', 'photos')
 * @returns {Promise<String>} - Public URL of uploaded file
 */
const uploadToSupabase = async (file, folder) => {
    try {
        if (!file || !file.buffer) {
            console.error('❌ Supabase Upload Failed: No file buffer provided');
            throw new Error('No file buffer provided');
        }

        // Clean filename and add timestamp
        const timestamp = Date.now();
        const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const fileName = `${folder}/${timestamp}_${safeOriginalName}`;

        console.log(`📡 [Supabase] Uploading ${file.mimetype} to ${fileName} (${(file.size / 1024).toFixed(2)} KB)`);

        const { data, error } = await supabase.storage
            .from('uploads')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                upsert: true // Allow upsert to avoid duplicate errors if retried
            });

        if (error) {
            console.error('❌ Supabase Storage Error:', error);
            throw new Error(`Storage Error: ${error.message}`);
        }

        const { data: publicUrlData } = supabase.storage
            .from('uploads')
            .getPublicUrl(fileName);

        if (!publicUrlData || !publicUrlData.publicUrl) {
            throw new Error('Could not generate public URL');
        }

        console.log('✅ [Supabase] Upload successful:', publicUrlData.publicUrl);
        return publicUrlData.publicUrl;

    } catch (error) {
        console.error('❌ [Supabase] Upload failed:', error.message);
        return null; // Return null so the caller can decide to fallback or fail
    }
};

/**
 * Delete a file from Supabase Storage
 * @param {String} fileUrl - Public URL of the file to delete
 * @returns {Promise<Boolean>} - Success status
 */
const deleteFromSupabase = async (fileUrl) => {
    try {
        if (!fileUrl) return false;

        // Extract filename from public URL
        // Example URL: https://ppyuyohomndnsyfpoxuh.supabase.co/storage/v1/object/public/uploads/resumes/123456789_file.pdf
        const urlParts = fileUrl.split('/uploads/');
        if (urlParts.length < 2) {
            console.error('❌ Invalid Supabase URL for deletion');
            return false;
        }

        const fileName = urlParts[1];
        const { error } = await supabase.storage
            .from('uploads')
            .remove([fileName]);

        if (error) {
            console.error('❌ Supabase Delete Error:', error);
            return false;
        }

        console.log(`✅ File deleted from Supabase: ${fileName}`);
        return true;

    } catch (error) {
        console.error('❌ Supabase delete failed:', error.message);
        return false;
    }
};

module.exports = {
    uploadToSupabase,
    deleteFromSupabase
};
