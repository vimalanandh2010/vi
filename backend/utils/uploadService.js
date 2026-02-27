const fs = require('fs');
const path = require('path');
const { uploadToSupabase } = require('./supabaseUpload');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
const subdirs = ['resumes', 'photos', 'videos'];
subdirs.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});
const uploadFile = async (file, folder) => {
    try {
        if (!file) {
            throw new Error('No file provided');
        }

        console.log(`🚀 [UploadService] Starting upload process for folder: ${folder}`);

        // 1. Attempt Supabase Upload (Primary)
        const supabaseUrl = await uploadToSupabase(file, folder);
        if (supabaseUrl) {
            console.log(`✅ [UploadService] File uploaded to Supabase: ${supabaseUrl}`);
            return supabaseUrl;
        }

        // 2. Fallback to Local Storage only if Supabase fails
        console.warn(`⚠️ [UploadService] Supabase upload failed for ${file.originalname}, falling back to Local storage...`);
        return await saveToLocal(file, folder);

    } catch (error) {
        console.error('❌ [UploadService] Error:', error);
        // Extreme fallback
        try {
            return await saveToLocal(file, folder);
        } catch (localError) {
            console.error('❌ [UploadService] Emergency local fallback failed:', localError);
            throw error;
        }
    }
};

// Helper for local storage (fallback)
const saveToLocal = async (file, folder) => {
    try {
        const fileName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const folderPath = path.join(uploadsDir, folder);

        // Ensure folder exists
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath, { recursive: true });
        }

        const filePath = path.join(folderPath, fileName);
        fs.writeFileSync(filePath, file.buffer);

        const fileUrl = `/uploads/${folder}/${fileName}`;
        console.log('💾 [LocalFallback] File saved locally:', fileUrl);
        return fileUrl;
    } catch (err) {
        console.error('❌ [LocalFallback] Error:', err);
        throw err;
    }
};

// Delete file from storage
const deleteFile = async (fileUrl) => {
    try {
        if (!fileUrl) return false;

        // Cloudinary deletion handled manually if needed (legacy), 
        // but not supported in the standard service now.

        // 2. Handle Supabase Deletion (legacy support)
        if (fileUrl.includes('supabase.co')) {
            const { deleteFromSupabase } = require('./supabaseUpload');
            return await deleteFromSupabase(fileUrl);
        }

        // 3. Handle Local Deletion
        if (fileUrl.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '..', fileUrl.split('?')[0]);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log('🗑️ File deleted from local storage:', fileUrl);
                return true;
            }
        }

        return false;
    } catch (error) {
        console.error('Delete error:', error);
        return false;
    }
};

module.exports = { uploadFile, deleteFile };