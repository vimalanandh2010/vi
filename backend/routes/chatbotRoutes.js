const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Import auth middleware to require login

// Seeker-side Knowledge Base
const seekerKnowledgeBase = [
    {
        keywords: ['hi', 'hello', 'hey', 'greetings'],
        response: 'Hello! 👋 I am your local career assistant. How can I help you jumpstart your career today?'
    },
    {
        keywords: ['resume', 'cv', 'portfolio'],
        response: '**Resume Tip:** Keep it concise (1-2 pages maximum). Highlight your achievements using action verbs (e.g., "Developed", "Led") rather than just listing responsibilities. Make sure your skills match the job you are applying for!'
    },
    {
        keywords: ['interview', 'prep', 'prepare'],
        response: '**Interview Prep:** Always research the company before you go in. Practice the STAR method (Situation, Task, Action, Result) for behavioral questions, and prepare 2-3 thoughtful questions to ask the interviewer at the end.'
    },
    {
        keywords: ['job', 'apply', 'search', 'find'],
        response: 'Head over to the **Jobs** tab in your dashboard! You can use the search bar and filters to find roles that perfectly match your skills and experience. Click "Apply Now" when you find a good fit.'
    },
    {
        keywords: ['course', 'learn', 'skill', 'study'],
        response: 'Check out the **Courses** section. We have a variety of materials posted by recruiters and educators to help you upskill and stand out.'
    },
    {
        keywords: ['salary', 'pay', 'compensation'],
        response: 'When researching salaries, look at market averages for your specific role and location. Our job postings often display salary ranges directly to help you set expectations!'
    },
    {
        keywords: ['community', 'network', 'chat'],
        response: 'Networking is key! Join the **Communities** tab to connect with other job seekers and recruiters, share experiences, and learn about unlisted opportunities.'
    }
];

// Recruiter-side Knowledge Base
const recruiterKnowledgeBase = [
    {
        keywords: ['hi', 'hello', 'hey', 'greetings'],
        response: 'Hello! 👋 I am your recruitment assistant. How can I help you manage your hiring process today?'
    },
    {
        keywords: ['post', 'create', 'posting', 'job'],
        response: 'To post a new job, go to **Job Postings** and click **Create New Post**. Make sure to include clear requirements and competitive salary ranges to attract top talent!'
    },
    {
        keywords: ['candidate', 'applicant', 'shortlist', 'hiring'],
        response: 'You can manage all your candidates in the **Applicants** section. Check the AI-driven ATS Match scores to quickly identify the best fits for your roles.'
    },
    {
        keywords: ['interview', 'schedule', 'jitsi', 'video'],
        response: 'To schedule an interview, go to an applicant\'s profile and select a time. We support built-in video calls via Jitsi Meet, and candidates will get an automated email with the link!'
    },
    {
        keywords: ['ats', 'score', 'match', 'score'],
        response: 'Our ATS Match Score analyzes candidate resumes against your job descriptions using local NLP logic. A score above 70% generally indicates a strong technical match.'
    },
    {
        keywords: ['verification', 'badge', 'verify'],
        response: 'Verified company profiles attract 30% more candidates! Ensure your company documents are uploaded in the **Verification** section to get your badge.'
    },
    {
        keywords: ['analytics', 'views', 'stats'],
        response: 'Check your **Dashboard** to see job view analytics and application trends to optimize your hiring strategy.'
    }
];

// @route   POST /api/bot-chat/ask
// @desc    Ask the helper chatbot a question (Local Logic)
// @access  Private
router.post('/ask', auth, async (req, res) => {
    try {
        const { message } = req.body;
        const userRole = req.user.role || 'seeker'; // Default to seeker if not specified

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const userText = message.toLowerCase();

        // Select knowledge base based on role
        const KB = userRole === 'employer' ? recruiterKnowledgeBase : seekerKnowledgeBase;
        const defaultResponse = userRole === 'employer'
            ? "I'm your recruitment bot! 🤖 I can help with **postings, candidates, interviews, ATS scores, and analytics**. Ask me anything about these topics!"
            : "I'm your career bot! 🤖 I can talk about **resumes, interviews, job searching, courses, and networking**. Try asking me about one of those!";

        let botResponse = defaultResponse;

        // Simple keyword matching logic
        for (const item of KB) {
            const matches = item.keywords.some(keyword => userText.includes(keyword));
            if (matches) {
                botResponse = item.response;
                break; // Stop after first match
            }
        }

        // Simulate a slight delay to feel like a real bot typing
        setTimeout(() => {
            res.json({ response: botResponse });
        }, 800);

    } catch (error) {
        console.error('[Chatbot Error]:', error);
        res.status(500).json({ message: 'Sorry, I encountered an internal error processing your request.' });
    }
});

module.exports = router;
