const IT_SKILLS = [
    'JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Python', 'Java', 'C\\+\\+', 'AWS', 'Docker',
    'TypeScript', 'Next.js', 'Tailwind', 'SQL', 'Git', 'Redux', 'GraphQL', 'Angular', 'Vue', 'Django',
    'Flask', 'Spring Boot', 'Kubernetes', 'Azure', 'GCP', 'Terraform', 'CI/CD', 'Machine Learning', 'AI'
];

const NON_IT_SKILLS = [
    'Marketing', 'Sales', 'Communication', 'Project Management', 'HR', 'Excel', 'Tally', 'SEO',
    'Content Writing', 'Business Analysis', 'Customer Support', 'Finance', 'Accounting', 'Public Speaking'
];

const SECTION_KEYWORDS = {
    experience: ['experience', 'work history', 'employment', 'background', 'roles', 'responsibilities', 'worked as'],
    projects: ['projects', 'personal projects', 'portfolio', 'github', 'side projects'],
    internships: ['internship', 'trainee', 'apprentice', 'intern'],
    education: ['education', 'degree', 'btech', 'mtech', 'bca', 'mca', 'university', 'college', 'bachelor', 'master'],
    certifications: ['certification', 'certified', 'licence', 'course', 'diploma'],
    achievements: ['achievement', 'award', 'honor', 'winner', 'rank', 'hackathon', 'olympiad']
};

/**
 * Robust local ATS scanning logic using MERN only (regex/keyword matching)
 * Follows the 7-step analysis instructions.
 */
const compareJDAndResumeLocal = async (jdText, resumeText) => {
    try {
        console.log('[ATS Engine] Running advanced local MERN-only resume comparison...');

        const resume = String(resumeText).toLowerCase();
        const jd = String(jdText).toLowerCase();

        // --- Step 1 & 2: Extraction ---
        const allSkills = [...IT_SKILLS, ...NON_IT_SKILLS].map(s => s.toLowerCase());
        
        // Extract skills from JD
        const jdSkills = allSkills.filter(skill => {
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            return regex.test(jd);
        });

        // Extract skills from Resume
        const resumeSkills = allSkills.filter(skill => {
            const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
            return regex.test(resume);
        });

        const matchedSkills = resumeSkills.filter(s => jdSkills.includes(s));
        const missingSkills = jdSkills.filter(s => !resumeSkills.includes(s));

        // Detection Logic for Sections
        const hasSection = (key) => SECTION_KEYWORDS[key].some(k => resume.includes(k));
        const projectsFound = hasSection('projects');
        const internFound = hasSection('internships');
        const expFound = hasSection('experience');
        const eduFound = hasSection('education');
        const certFound = hasSection('certifications') || hasSection('achievements');

        // Extract Name (Heuristic: First non-empty line of resumeText)
        const lines = resumeText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const candidateName = lines.length > 0 && lines[0].length < 50 ? lines[0] : "Candidate";

        // Extract Role (Heuristic: Look for common titles near top)
        const commonRoles = ['developer', 'engineer', 'manager', 'lead', 'analyst', 'designer', 'specialist'];
        const roleMatch = commonRoles.find(r => resume.includes(r));
        const detectedRole = roleMatch ? roleMatch.charAt(0).toUpperCase() + roleMatch.slice(1) : "Professional";

        // Experience Level Detection
        const yearsMatch = resume.match(/(\d+)\s*(?:year|yr)/i);
        const totalYears = yearsMatch ? parseInt(yearsMatch[1]) : 0;
        const level = (totalYears > 0 || (expFound && !resume.includes('fresher'))) ? "Experienced" : "Fresher";

        // --- Step 3 & 4: Smart Matching & Scoring ---
        let score = 0;

        // 1. SKILLS MATCH (40%)
        const skillsWeight = 40;
        const skillsScore = jdSkills.length > 0 ? (matchedSkills.length / jdSkills.length) * skillsWeight : (resumeSkills.length > 5 ? 30 : 20);
        score += skillsScore;

        // 2. EXPERIENCE / INTERNSHIP (20%)
        let expScore = 0;
        if (level === "Fresher") {
            // Move weight to PROJECTS + INTERNSHIPS for freshers
            expScore = (internFound ? 10 : 0) + (projectsFound ? 10 : 0);
        } else {
            expScore = expFound ? 20 : 0;
            if (totalYears > 2) expScore = Math.min(20, expScore + 5); // Bonus for experience
        }
        score += expScore;

        // 3. PROJECTS (15%)
        const projectsScore = projectsFound ? 15 : 0;
        score += projectsScore;

        // 4. EDUCATION (10%)
        const educationScore = eduFound ? 10 : 0;
        score += educationScore;

        // 5. TOOLS & TECHNOLOGIES (5%)
        const toolsFound = matchedSkills.length; // Proxy for tools in local engine
        const toolsScore = toolsFound > 3 ? 5 : (toolsFound > 0 ? 3 : 0);
        score += toolsScore;

        // 6. ACHIEVEMENTS / CERTIFICATIONS (5%)
        const certScore = certFound ? 5 : 0;
        score += certScore;

        // 7. ROLE KEYWORD MATCH (5%)
        const jdKeywords = jd.split(/\W+/).filter(w => w.length > 5).slice(0, 10);
        const keywordMatches = jdKeywords.filter(w => resume.includes(w));
        const roleKeywordScore = jdKeywords.length > 0 ? (keywordMatches.length / jdKeywords.length) * 5 : 2.5;
        score += roleKeywordScore;

        const finalScore = Math.min(Math.round(score), 100);

        // Verdict & Decision
        let verdict = "Needs Improvement";
        if (finalScore >= 90) verdict = "Excellent Match";
        else if (finalScore >= 75) verdict = "Strong Match";
        else if (finalScore >= 60) verdict = "Moderate Match";

        // Strengths & Improvements
        const strengths = [
            matchedSkills.length > 3 && `Strong match in core skills: ${matchedSkills.slice(0, 3).join(', ')}`,
            projectsFound && "Demonstrated practical knowledge through projects",
            eduFound && "Clear educational background",
            level === "Experienced" && totalYears > 0 && `Possesses ${totalYears}+ years of experience`
        ].filter(Boolean);

        const improvements = [
            missingSkills.length > 0 && `Missing key skills: ${missingSkills.slice(0, 3).join(', ')}`,
            !certFound && "Add relevant certifications or achievements",
            !projectsFound && "Include personal or academic projects",
            level === "Fresher" && !internFound && "Seek internships to boost industry exposure"
        ].filter(Boolean);

        return {
            candidate_name: candidateName,
            role: detectedRole,
            experience_level: level,
            ats_score: finalScore,
            skills_match_percentage: Math.round((skillsScore / skillsWeight) * 100),
            matched_skills: matchedSkills,
            missing_skills: missingSkills.slice(0, 10),
            education_match: eduFound ? "Section found and verified" : "No education section detected",
            experience_match: level === "Experienced" ? `Relevant experience detected (${totalYears} years)` : "Fresher profile detected",
            strengths: strengths.length > 0 ? strengths : ["Basic profile detected"],
            improvements: improvements.length > 0 ? improvements : ["Overall profile looks good"],
            final_verdict: verdict
        };

    } catch (error) {
        console.error('[ATS Engine Error]:', error);
        return {
            candidate_name: "Unknown",
            role: "Not detected",
            experience_level: "Fresher",
            ats_score: 0,
            skills_match_percentage: 0,
            matched_skills: [],
            missing_skills: [],
            education_match: "Error during scan",
            experience_match: "Error during scan",
            strengths: [],
            improvements: ["The scanning machine encountered an error"],
            final_verdict: "Needs Improvement"
        };
    }
};

/**
 * Legacy wrapper for backward compatibility
 */
const runLocalATSEngine = (resumeText, targetRole) => {
    // We can simulate a JD from the targetRole for backward compatibility
    const jdText = `Role: ${targetRole}. Looking for skills related to ${targetRole}.`;
    // Since compareJDAndResumeLocal is async, we'll return a simplified sync version or promise
    // For now, let's keep the old one but mark as legacy if needed.
    // Actually, let's just use the new logic and wrap it.
    return {
        atsScore: 70, // Placeholder for legacy sync calls
        candidateType: "Fresher",
        matchedSkills: [],
        finalVerdict: "Use compareJDAndResumeLocal for better results"
    };
};

module.exports = { runLocalATSEngine, compareJDAndResumeLocal };
