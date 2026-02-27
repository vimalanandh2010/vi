/**
 * FEATURE: Local Resume ATS Analysis
 * Follows strict weighted scoring model:
 * SKILLS: 40% | EXP/INT: 20% | PROJ: 15% | EDU: 10% | TOOLS: 5% | ACHIEV: 5% | ROLE: 5%
 */

const SKILLS_DB = [
    'javascript', 'python', 'java', 'react', 'node.js', 'mongodb', 'sql', 'html', 'css',
    'typescript', 'aws', 'docker', 'kubernetes', 'git', 'django', 'flask', 'fastapi',
    'spring', 'hibernate', 'angular', 'vue', 'next.js', 'tailwind', 'express',
    'rest api', 'graphql', 'microservices', 'devops', 'ci/cd', 'linux', 'azure', 'gcp',
    'tensorflow', 'pytorch', 'machine learning', 'deep learning', 'nlp', 'pandas', 'numpy',
    'tableau', 'power bi', 'excel', 'agile', 'scrum', 'jira', 'php', 'laravel', 'c++', 'c#', '.net'
];

const TOOLS_DB = ['jira', 'git', 'docker', 'kubernetes', 'postman', 'figma', 'tableau', 'excel', 'vscode', 'jenkins', 'aws', 'azure'];

const SECTION_KEYWORDS = {
    experience: ['experience', 'work history', 'employment', 'background', 'roles', 'responsibilities'],
    projects: ['projects', 'personal projects', 'portfolio', 'github'],
    internships: ['internship', 'trainee', 'apprentice'],
    education: ['education', 'degree', 'btech', 'mtech', 'bca', 'mca', 'university', 'college'],
    certifications: ['certification', 'certified', 'licence', 'course'],
    achievements: ['achievement', 'award', 'honor', 'winner', 'rank', 'hackathon']
};

const analyzeATS = async (resumeText, jobDescription) => {
    try {
        const text = resumeText.toLowerCase();
        const jd = jobDescription.toLowerCase();

        // Helper: Extract items from text based on DB
        const extract = (db, src) => db.filter(item => {
            const regex = new RegExp(`\\b${item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            return regex.test(src);
        });

        const jdSkills = extract(SKILLS_DB, jd);
        const resumeSkills = extract(SKILLS_DB, text);
        const jdTools = extract(TOOLS_DB, jd);
        const resumeTools = extract(TOOLS_DB, text);

        const matchedSkills = resumeSkills.filter(s => jdSkills.includes(s));
        const missingSkills = jdSkills.filter(s => !resumeSkills.includes(s));
        const matchedTools = resumeTools.filter(t => jdTools.includes(t));

        // Detection Logic
        const hasSection = (key) => SECTION_KEYWORDS[key].some(k => text.includes(k));
        const projectsFound = hasSection('projects');
        const internFound = hasSection('internships');
        const expFound = hasSection('experience');
        const eduFound = hasSection('education');
        const certFound = hasSection('certifications') || hasSection('achievements');

        // Level Logic
        // Simple heuristic: if tenure/experience mentioned or no fresher/student keywords
        const isExperienced = text.includes('years of experience') || (expFound && !text.includes('fresher'));
        const level = isExperienced ? "Experienced" : "Fresher";

        // Weights
        let score = 0;

        // 1. SKILLS MATCH (40%)
        const skillsScore = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) * 40 : 20;
        score += skillsScore;

        // 2. EXPERIENCE / INTERNSHIP (20%)
        let expScore = 0;
        if (level === "Fresher") {
            // Move weight to PROJECTS + INTERNSHIPS
            const subScore = (internFound ? 10 : 0) + (projectsFound ? 10 : 0);
            expScore = subScore;
        } else {
            expScore = expFound ? 20 : 0;
        }
        score += expScore;

        // 3. PROJECTS (15%)
        const projectsScore = projectsFound ? 15 : 0;
        score += projectsScore;

        // 4. EDUCATION (10%)
        const educationScore = eduFound ? 10 : 0;
        score += educationScore;

        // 5. TOOLS & TECHNOLOGIES (5%)
        const toolsScore = jdTools.length > 0 ? (matchedTools.length / jdTools.length) * 5 : 2.5;
        score += toolsScore;

        // 6. ACHIEVEMENTS / CERTIFICATIONS (5%)
        const certScore = certFound ? 5 : 0;
        score += certScore;

        // 7. ROLE KEYWORD MATCH (5%)
        const commonWords = jd.split(/\W+/).filter(w => w.length > 5).slice(0, 10);
        const keywordMatches = commonWords.filter(w => text.includes(w));
        const roleScore = commonWords.length > 0 ? (keywordMatches.length / commonWords.length) * 5 : 2.5;
        score += roleScore;

        const atsScore = Math.min(Math.round(score), 100);

        // Verdict
        let verdict = "Needs Improvement";
        if (atsScore >= 90) verdict = "Excellent Match";
        else if (atsScore >= 75) verdict = "Strong Match";
        else if (atsScore >= 60) verdict = "Moderate Match";

        return {
            candidate_name: "Candidate",
            role: resumeSkills[0] || "Professional",
            experience_level: level,
            ats_score: atsScore,
            skills_match_percentage: Math.round((skillsScore / 40) * 100),
            matched_skills: matchedSkills,
            missing_skills: missingSkills.slice(0, 8),
            education_match: eduFound ? "Match" : "No Section Found",
            experience_match: expFound ? "Relevant" : "Not Detected",
            strengths: [
                matchedSkills.length > 5 && "Strong technical core",
                projectsFound && "Project work demonstrated",
                eduFound && "Clear academic background"
            ].filter(Boolean),
            improvements: [
                missingSkills.length > 0 && `Focus on: ${missingSkills.slice(0, 2).join(', ')}`,
                !certFound && "Add certifications to boost credibility",
                !expFound && !internFound && "Showcase internship or work history"
            ].filter(Boolean),
            final_verdict: verdict
        };
    } catch (err) {
        console.error('[ATS Analysis Error]:', err);
        throw err;
    }
};

module.exports = { analyzeATS };
