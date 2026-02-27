const { calculateMatchScore } = require('../services/matchingService');

// Mock data for testing match score logic
const mockJob = {
    title: 'Senior React Developer',
    requiredSkills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
    experienceLevel: 'Senior Level',
    location: 'Bangalore'
};

const mockSeeker = {
    firstName: 'John',
    lastName: 'Doe',
    skills: ['React', 'JavaScript', 'Node.js'],
    experienceLevel: 'senior',
    preferredRole: 'React Developer',
    location: 'Bangalore'
};

const testMatchingLogic = () => {
    console.log('--- Testing Matching Logic ---');
    const result = calculateMatchScore(mockJob, mockSeeker);
    console.log('Match Result:', result);

    // Expected score breakdown:
    // Skills: 3/4 = 75% * 0.50 = 37.5
    // Experience: senior matches Senior Level = 20
    // Location: matches = 15
    // Role: 'React Developer' in 'Senior React Developer' = 15
    // Total approx: 87.5 -> 88

    if (result.matchScore >= 80) {
        console.log('✅ Match score logic passed!');
    } else {
        console.error('❌ Match score logic failed. Expected high score, got:', result.matchScore);
    }
};

testMatchingLogic();
