import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { resumeText, jobDescription } = req.body;

    if (!resumeText) {
        return res.status(400).json({ error: 'Resume text is required' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `You are a professional ATS (Applicant Tracking System) used by top companies.
Analyze the following resume against the job description with extreme precision.

SCORING RULES (Strictly follow these to calculate the ATS Score):
1. MATCHED SKILLS (40% weight): Give 1 point for every 6 relevant technical skills or keywords found that match the job description.
2. EXPERIENCE RELEVANCE (30% weight): Score based on how well the work history matches the roles/responsibilities.
3. EDUCATION & CERTIFICATIONS (20% weight): Give bonus points for relevant certifications mentioned in the job description.
4. FORMATTING & READABILITY (10% weight): Score based on section headers and clarity.

Job Description:
${jobDescription || "General technical profile analysis"}

Resume:
${resumeText}

Respond ONLY in JSON format with this exact structure:
{
  "matchScore": <number 0-100>,
  "keyMatches": ["<skill1>", "<skill2>", ...],
  "missingSkills": ["<skill1>", "<skill2>", ...],
  "recommendation": "<Strong Match|Moderate Match|Weak Match|Reject>",
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<weakness1>", "<weakness2>", ...],
  "improvements": ["<improvement1>", "<improvement2>", ...],
  "summary": "<2-line professional summary>"
}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Extract JSON
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("Could not find JSON in AI response");
        }

        const analysis = JSON.parse(jsonMatch[0]);
        res.status(200).json(analysis);

    } catch (error) {
        console.error('Gemini Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze resume', details: error.message });
    }
}
