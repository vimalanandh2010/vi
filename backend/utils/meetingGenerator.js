/**
 * Meeting Link Generator
 * Generate free video meeting links for interviews
 */

/**
 * Generate a unique Jitsi Meet link
 * @param {string} applicationId - Application ID
 * @param {string} candidateName - Candidate's name (optional)
 * @returns {Object} Meeting details
 */
const generateJitsiLink = (applicationId, candidateName = '') => {
    // Create a unique, readable room name
    const timestamp = Date.now();
    const sanitizedName = candidateName.replace(/[^a-zA-Z0-9]/g, '');
    const roomName = `JobPortal-Interview-${sanitizedName}-${timestamp}`;
    
    return {
        platform: 'Jitsi Meet',
        link: `https://meet.jit.si/${roomName}`,
        instructions: 'Click the link to join the video interview. No account or app download required - works directly in your browser!',
        roomName: roomName
    };
};

/**
 * Generate meeting link for interview
 * @param {Object} options - Options object
 * @param {string} options.applicationId - Application ID
 * @param {string} options.candidateName - Candidate name
 * @param {string} options.jobTitle - Job title (optional)
 * @returns {string} Meeting link
 */
const generateMeetingLink = ({ applicationId, candidateName, jobTitle }) => {
    const meeting = generateJitsiLink(applicationId, candidateName);
    return meeting.link;
};

module.exports = {
    generateJitsiLink,
    generateMeetingLink
};
