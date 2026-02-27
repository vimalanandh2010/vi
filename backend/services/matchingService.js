const Job = require('../models/Job');
const User = require('../models/User');

/**
 * Calculates a match score (0-100) between a job and a seeker
 * @param {Object} job - The job document
 * @param {Object} seeker - The seeker/user document
 * @returns {Object} - { matchScore, matchedSkills }
 */
const calculateMatchScore = (job, seeker) => {
    let score = 0;
    const weights = {
        skills: 0.50,
        experience: 0.20,
        location: 0.15,
        role: 0.15
    };

    // 1. Skills Match (50%)
    let jobSkills = job.requiredSkills || [];
    if (jobSkills.length === 0) {
        jobSkills = [...(job.skills || []), ...(job.tags || [])];
    }
    const seekerSkills = seeker.skills || [];
    let matchedSkills = [];

    if (jobSkills.length > 0) {
        matchedSkills = jobSkills.filter(skill =>
            seekerSkills.some(s => s.toLowerCase() === skill.toLowerCase())
        );
        const skillScore = (matchedSkills.length / jobSkills.length) * 100;
        score += skillScore * weights.skills;
    } else {
        // If no skills required, give full points for skills
        score += 100 * weights.skills;
    }

    // 2. Experience Level Match (20%)
    // Mapping: seeker -> job
    const expMap = {
        'fresher': 'Entry Level',
        'entry': 'Entry Level',
        'mid': 'Mid-Senior Level',
        'senior': 'Senior Level',
        'expert': 'Expert/Principal',
        'principal': 'Expert/Principal',
        'experienced': 'Mid-Senior Level'
    };

    const seekerLevelMapped = expMap[seeker.experienceLevel] || 'Entry Level';
    if (seekerLevelMapped === job.experienceLevel) {
        score += 100 * weights.experience;
    } else {
        // Partial score for different levels (e.g., Senior for Mid job)
        // For simplicity, we'll do 0 or 100 for now, or maybe 50 if it's "close"
        score += 0;
    }

    // 3. Location Match (15%)
    if (job.location && seeker.location &&
        (job.location.toLowerCase().includes(seeker.location.toLowerCase()) ||
            seeker.location.toLowerCase().includes(job.location.toLowerCase()))) {
        score += 100 * weights.location;
    }

    // 4. Preferred Role Match (15%)
    if (job.title && seeker.preferredRole &&
        (job.title.toLowerCase().includes(seeker.preferredRole.toLowerCase()) ||
            seeker.preferredRole.toLowerCase().includes(job.title.toLowerCase()))) {
        score += 100 * weights.role;
    }

    return {
        matchScore: Math.round(score),
        matchedSkills
    };
};

/**
 * Gets recommended candidates for a specific job
 * @param {string} jobId - The ID of the job
 * @returns {Promise<Array>} - List of recommended candidates
 */
const getRecommendedCandidates = async (jobId) => {
    try {
        const job = await Job.findById(jobId);
        if (!job) throw new Error('Job not found');

        // Fetch all seekers
        const seekers = await User.find({ role: 'seeker' });

        const recommendations = seekers.map(seeker => {
            const { matchScore, matchedSkills } = calculateMatchScore(job, seeker);
            return {
                candidateId: seeker._id,
                name: `${seeker.firstName} ${seeker.lastName || ''}`,
                matchScore,
                matchedSkills,
                resumeUrl: seeker.resumeUrl,
                location: seeker.location,
                experienceLevel: seeker.experienceLevel
            };
        });

        // Filter out very low scores and sort by score
        return recommendations
            .filter(r => r.matchScore > 20)
            .sort((a, b) => b.matchScore - a.matchScore);
    } catch (error) {
        console.error('[MatchingService Error]:', error.message);
        throw error;
    }
};

module.exports = { calculateMatchScore, getRecommendedCandidates };
