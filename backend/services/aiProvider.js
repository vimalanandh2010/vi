/**
 * Universal AI Provider Service
 * Now uses Puter.js AI on frontend instead of Python backend
 */

class AIProvider {
    constructor() {
        this.provider = 'Puter.js (client-side)';
    }

    /**
     * Generic analysis method
     * @param {string} prompt 
     * @param {string} resumeUrl (Optional PDF url)
     */
    async analyze(prompt, resumeUrl = null) {
        try {
            return {
                message: "AI Provider Active",
                provider: this.provider,
                note: "Please use Puter.js AI on the frontend for analysis"
            };
        } catch (error) {
            console.error('[AI Provider] Error:', error.message);
            throw error;
        }
    }

    /**
     * Direct AI call implementation using Puter.js
     */
    async callAI(payload) {
        // Implementation handled on frontend with Puter.js
        return {
            message: "Using Puter.js AI on frontend",
            provider: this.provider
        };
    }
}

module.exports = new AIProvider();
