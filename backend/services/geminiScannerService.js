const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');
const { compareJDAndResumeLocal } = require('./localAtsEngineService');

// Ensure env vars are loaded
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Compares a job description with a resume using Gemini AI with an automatic local fallback
 * @param {string} jdText - The text of the job description
 * @param {string} resumeText - The text extracted from the resume
 * @returns {Promise<Object>} - Structured analysis result
 */
const compareJDAndResume = async (jdText, resumeText) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            console.warn('[GeminiService] No API key found. Falling back to Local Engine.');
            return await compareJDAndResumeLocal(jdText, resumeText);
        }

        const prompt = `
            You are an advanced ATS Resume Analyzer. 
            Your task is to evaluate a candidate's resume against a given Job Description and return a detailed ATS compatibility report. 
            The system must work for both Fresher candidates and Experienced candidates.

            JOB DESCRIPTION:
            """
            ${jdText}
            """

            CANDIDATE RESUME:
            """
            ${resumeText}
            """

            -------------------------------------------------- 
            ANALYSIS INSTRUCTIONS: 

            Step 1: Extract and classify from the resume: 
            - Candidate Name 
            - Role / Title 
            - Skills (technical + tools + frameworks) 
            - Education 
            - Projects 
            - Internships 
            - Work Experience 
            - Certifications 
            - Achievements 
            - Total Years of Experience 

            Step 2: Identify Job Requirements from JD: 
            Extract: 
            - Required Skills 
            - Secondary / Good-to-have Skills 
            - Minimum Education 
            - Minimum Experience 
            - Role keywords 
            - Responsibilities 

            Step 3: Smart Matching Logic 
            For FRESHERS: Give weight to Projects, Internships, Relevant skills, Hackathons / achievements, Core concepts.
            For EXPERIENCED CANDIDATES: Give weight to Years of experience, Impact (metrics like %, revenue, performance), Role relevance, Production-level work.

            Step 4: ATS SCORING (0 – 100) 
            Use this weighted scoring model: 
            CORE SKILLS MATCH → 45% (Match required skills & stack)
            EXPERIENCE / PROJECTS → 25% (Years for Pros, Projects/Internships for Freshers)
            RELEVANCE & CONTEXT → 15% (Role identity, domain knowledge)
            EDUCATION & CERTIFICATIONS → 10% (Degree Relevance)
            SOFT SKILLS / IMPACT → 5% (Metrics, communication markers)

            If candidate is a Fresher: Move EXPERIENCE weight (25%) entirely to PROJECTS, INTERNSHIPS, and COMPETITIVE PROGRAMMING.
            If candidate is Experienced: Focus on "Years of experience" vs "JD requirements" and "Impact metrics".

            Step 5: MISSING KEYWORDS 
            Identify important JD skills not found in the resume. 

            Step 6: STRENGTHS 
            List what makes the resume strong for the role. 

            Step 7: IMPROVEMENT SUGGESTIONS 
            Give specific and practical suggestions.

            -------------------------------------------------- 
            SCORING RULES: 
            90 – 100 → Excellent match (Perfect stack + proper experience)
            75 – 89  → Strong match (Great stack match, minor gaps)
            60 – 74  → Moderate match (Matches core but lacks specific secondary skills)
            Below 60 → Needs improvement (Major skill gaps or role mismatch)

            IMPORTANT RULES: 
            - Be realistic. If a candidate has 80% of skills, the score should reflect that (~80).
            - Do NOT penalize freshers for lack of "years" if they have high-quality projects in the same stack.
            - Consider synonyms (React = React.js, Node = Node.js, Express = ExpressJS). 
            - Maintain high standards for lead/senior roles.

            -------------------------------------------------- 
            FINAL OUTPUT FORMAT (STRICT JSON): 
            { 
              "candidate_name": "", 
              "role": "", 
              "experience_level": "Fresher / Experienced", 
              "ats_score": 0, 
              "skills_match_percentage": 0, 
              "matched_skills": [], 
              "missing_skills": [], 
              "education_match": "Detailed status", 
              "experience_match": "Detailed status", 
              "summary": "2-3 sentences max summarizing the candidate fit",
              "final_verdict": "Strong Match / Moderate Match / Weak Match" 
            }

            Return ONLY the raw JSON object. No markdown, no intro, no outro.
        `;

        console.log('[GeminiService] Sending request to Gemini using @google/generative-ai...');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up the response in case Gemini adds markdown code blocks
        const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

        try {
            return JSON.parse(cleanJson);
        } catch (parseError) {
            console.error('[GeminiService] JSON Parse Error:', parseError.message);
            console.error('[GeminiService] Raw Result:', text);
            // Fallback to local engine on parse error
            return await compareJDAndResumeLocal(jdText, resumeText);
        }
    } catch (error) {
        console.warn(`[GeminiService] AI Error (${error.message}). Triggering Local Fallback...`);
        // Handle 404, 429, etc. by falling back to local MERN scanner
        return await compareJDAndResumeLocal(jdText, resumeText);
    }
};

const fs = require('fs');

/**
 * Extracts text from a file (image or PDF) using Gemini Vision (OCR)
 * @param {string} filePath - Path to the local file
 * @returns {Promise<string>} - Extracted text
 */
const extractTextFromFile = async (filePath) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not defined');
        }

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = filePath.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg'; // Simplification

        const result = await model.generateContent([
            "Extract all text from this document accurately. Maintain the structure as much as possible.",
            {
                inlineData: {
                    data: fileBuffer.toString('base64'),
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('[GeminiService OCR Error]:', error.message);
        throw error;
    }
};

/**
 * Extracts technical skills from text using Gemini
 * @param {string} text - The text to extract skills from
 * @returns {Promise<string[]>} - Array of technical skills
 */
const extractSkillsFromText = async (text) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return []; // Fallback or throw error
        }

        const prompt = `
            Extract only technical skills from the following text.
            Return the result as a clean JSON array of strings.
            Do not include explanations, intro, or outro.
            
            TEXT:
            """
            ${text}
            """
        `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const resultText = response.text();

        // Clean up and parse JSON
        const cleanJson = resultText.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(cleanJson);
        } catch (e) {
            console.error('[GeminiService Skill Extraction Parse Error]:', e.message);
            // Simple regex fallback if JSON fails
            const matches = resultText.match(/"([^"]+)"/g);
            if (matches) return matches.map(m => m.replace(/"/g, ''));
            return [];
        }
    } catch (error) {
        console.error('[GeminiService Skill Extraction Error]:', error.message);
        return [];
    }
};

module.exports = { compareJDAndResume, extractTextFromFile, extractSkillsFromText };
