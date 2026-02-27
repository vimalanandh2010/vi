/**
 * FEATURE 2: Recruiter Multi-Resume Scanner
 * Now uses Puter.js AI on frontend
 */

const scanResumes = async (resumes, jobDescription) => {
    try {
        // Return message indicating to use Puter.js on frontend
        return {
            message: 'Please use Puter.js AI on the frontend for resume scanning',
            note: 'AI scanning is now handled client-side using Puter.js',
            resumes: resumes.map(r => ({
                name: r.name || "Candidate",
                score: 0,
                status: 'pending_frontend_analysis'
            }))
        };
    } catch (error) {
        console.error('[Scanner Service] Error:', error.message);
        throw new Error('Failed to scan resumes');
    }
};

module.exports = { scanResumes };
