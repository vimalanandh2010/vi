// Minimal version of calculateMatchScore for testing logic without DB models
const calculateMatchScore = (job, seeker) => {
    let score = 0;
    const weights = {
        skills: 0.50,
        experience: 0.20,
        location: 0.15,
        role: 0.15
    };

    // 1. Skills Match (50%)
    const jobSkills = job.requiredSkills || [];
    const seekerSkills = seeker.skills || [];
    let matchedSkills = [];

    if (jobSkills.length > 0) {
        matchedSkills = jobSkills.filter(skill =>
            seekerSkills.some(s => s.toLowerCase() === skill.toLowerCase())
        );
        const skillScore = (matchedSkills.length / jobSkills.length) * 100;
        score += skillScore * weights.skills;
    } else {
        score += 100 * weights.skills;
    }

    // 2. Experience Level Match (20%)
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

const mockJob = {
    title: 'Senior React Developer',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
    experienceLevel: 'Senior Level',
    location: 'Bangalore'
};

const mockSeeker = {
    skills: ['React', 'JavaScript', 'Node.js'],
    experienceLevel: 'senior',
    preferredRole: 'React Developer',
    location: 'Bangalore'
};

const result = calculateMatchScore(mockJob, mockSeeker);
console.log('Result:', result);
if (result.matchScore >= 80) console.log('MATCH_LOGIC_PASSED');
else console.log('MATCH_LOGIC_FAILED');
