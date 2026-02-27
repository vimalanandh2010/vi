const { extractText } = require('../services/documentParser');
const { compareJDAndResumeLocal } = require('../services/localAtsEngineService');
const { compareJDAndResume } = require('../services/geminiScannerService');

exports.runEngine = async (req, res) => {
    try {
        const { resumeUrl, targetRole } = req.body;

        if (!resumeUrl) {
            return res.status(400).json({ message: 'Resume URL is required' });
        }

        console.log(`[ATS Controller] Starting analysis for: ${resumeUrl}`);

        // Step 1: Extract Text
        const text = await extractText(resumeUrl);

        // Step 2: Prepare a simple JD from the target role
        const jdText = `Looking for a professional for the role of ${targetRole}.`;

        // Step 3: Run Engine (Using the advanced local logic)
        const results = await compareJDAndResumeLocal(jdText, text);

        res.json(results);
    } catch (error) {
        console.error('[ATS Controller Error]:', error.message);
        res.status(500).json({
            message: 'Error running ATS analysis',
            error: error.message
        });
    }
};

exports.runAdvancedAnalysis = async (req, res) => {
    try {
        const { resumeUrl, jdText } = req.body;

        if (!resumeUrl || !jdText) {
            return res.status(400).json({ message: 'Resume URL and Job Description text are required' });
        }

        console.log(`[ATS Controller] Starting advanced analysis for: ${resumeUrl}`);

        // Step 1: Extract Text
        const resumeText = await extractText(resumeUrl);

        // Step 2: Run Advanced AI Analysis (with automatic local fallback)
        const analysis = await compareJDAndResume(jdText, resumeText);

        res.json(analysis);
    } catch (error) {
        console.error('[ATS Controller Advanced Error]:', error.message);
        res.status(500).json({
            message: 'Error running advanced ATS analysis',
            error: error.message
        });
    }
};
