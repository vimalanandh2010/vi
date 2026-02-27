const mongoose = require('mongoose');
require('dotenv').config();

// Job Schema
const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    type: { type: String, enum: ['Full-time', 'Part-time', 'Contract', 'Internship'], default: 'Full-time' },
    category: { type: String, required: true },
    salary: { type: String },
    description: { type: String, required: true },
    requirements: [String],
    skills: [String],
    experience: { type: String },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    postedDate: { type: Date, default: Date.now },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true }
});

const Job = mongoose.model('Job', jobSchema);

// Diverse Job Data
const jobs = [
    // IT & Technology Jobs
    {
        title: 'Senior Full Stack Developer',
        company: 'TechCorp Solutions',
        location: 'San Francisco, CA',
        type: 'Full-time',
        category: 'IT & Technology',
        salary: '$120,000 - $180,000',
        description: 'We are looking for an experienced Full Stack Developer to join our dynamic team. You will work on cutting-edge web applications using modern technologies.',
        requirements: [
            'Bachelor\'s degree in Computer Science or related field',
            '5+ years of experience in full stack development',
            'Strong problem-solving skills',
            'Excellent communication skills'
        ],
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'TypeScript', 'AWS'],
        experience: '5+ years',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'DevOps Engineer',
        company: 'CloudScale Inc',
        location: 'Austin, TX',
        type: 'Full-time',
        category: 'IT & Technology',
        salary: '$110,000 - $160,000',
        description: 'Join our DevOps team to build and maintain scalable cloud infrastructure. Work with cutting-edge tools and technologies.',
        requirements: [
            'Experience with CI/CD pipelines',
            'Strong knowledge of Docker and Kubernetes',
            'Cloud platform experience (AWS/Azure/GCP)',
            'Scripting skills in Python or Bash'
        ],
        skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins', 'Terraform', 'Python'],
        experience: '3+ years',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'UI/UX Designer',
        company: 'DesignHub',
        location: 'New York, NY',
        type: 'Full-time',
        category: 'Design',
        salary: '$80,000 - $120,000',
        description: 'Create beautiful and intuitive user interfaces for web and mobile applications. Collaborate with developers and product managers.',
        requirements: [
            'Portfolio demonstrating UI/UX work',
            'Proficiency in Figma and Adobe Creative Suite',
            'Understanding of user-centered design principles',
            'Experience with prototyping tools'
        ],
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Wireframing'],
        experience: '3+ years',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'Data Scientist',
        company: 'DataMinds Analytics',
        location: 'Boston, MA',
        type: 'Full-time',
        category: 'Data Science',
        salary: '$130,000 - $190,000',
        description: 'Analyze complex datasets and build machine learning models to drive business insights and decision-making.',
        requirements: [
            'Master\'s or PhD in Data Science, Statistics, or related field',
            'Strong programming skills in Python or R',
            'Experience with machine learning frameworks',
            'Excellent analytical and problem-solving skills'
        ],
        skills: ['Python', 'R', 'TensorFlow', 'PyTorch', 'SQL', 'Machine Learning', 'Statistics'],
        experience: '4+ years',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Healthcare Jobs
    {
        title: 'Registered Nurse - ICU',
        company: 'City General Hospital',
        location: 'Chicago, IL',
        type: 'Full-time',
        category: 'Healthcare',
        salary: '$70,000 - $95,000',
        description: 'Provide critical care to patients in the Intensive Care Unit. Work with a dedicated team of healthcare professionals.',
        requirements: [
            'Valid RN license',
            'BLS and ACLS certification',
            'ICU experience preferred',
            'Strong clinical skills'
        ],
        skills: ['Critical Care', 'Patient Assessment', 'IV Therapy', 'Ventilator Management', 'Emergency Response'],
        experience: '2+ years',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'Medical Laboratory Technician',
        company: 'HealthLab Diagnostics',
        location: 'Houston, TX',
        type: 'Full-time',
        category: 'Healthcare',
        salary: '$45,000 - $65,000',
        description: 'Perform laboratory tests and analyses to assist in the diagnosis and treatment of diseases.',
        requirements: [
            'Associate degree in Medical Laboratory Technology',
            'MLT certification',
            'Knowledge of laboratory equipment and procedures',
            'Attention to detail'
        ],
        skills: ['Laboratory Testing', 'Microscopy', 'Blood Analysis', 'Quality Control', 'Lab Safety'],
        experience: '1-3 years',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'Physical Therapist',
        company: 'Wellness Rehabilitation Center',
        location: 'Seattle, WA',
        type: 'Full-time',
        category: 'Healthcare',
        salary: '$75,000 - $100,000',
        description: 'Help patients recover from injuries and improve their mobility through therapeutic exercises and treatments.',
        requirements: [
            'Doctor of Physical Therapy (DPT) degree',
            'State PT license',
            'Strong interpersonal skills',
            'Experience with diverse patient populations'
        ],
        skills: ['Manual Therapy', 'Exercise Prescription', 'Patient Education', 'Rehabilitation', 'Pain Management'],
        experience: '2+ years',
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Education Jobs
    {
        title: 'High School Math Teacher',
        company: 'Lincoln High School',
        location: 'Portland, OR',
        type: 'Full-time',
        category: 'Education',
        salary: '$50,000 - $70,000',
        description: 'Teach mathematics to high school students, develop curriculum, and foster a positive learning environment.',
        requirements: [
            'Bachelor\'s degree in Mathematics or Education',
            'Valid teaching certification',
            'Strong classroom management skills',
            'Passion for education'
        ],
        skills: ['Curriculum Development', 'Classroom Management', 'Student Assessment', 'Educational Technology', 'Communication'],
        experience: '2+ years',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'Elementary School Teacher',
        company: 'Sunshine Elementary',
        location: 'Denver, CO',
        type: 'Full-time',
        category: 'Education',
        salary: '$45,000 - $65,000',
        description: 'Create engaging lessons for elementary students across multiple subjects. Foster creativity and critical thinking.',
        requirements: [
            'Bachelor\'s degree in Elementary Education',
            'State teaching license',
            'Experience with diverse learners',
            'Patient and nurturing personality'
        ],
        skills: ['Lesson Planning', 'Child Development', 'Classroom Management', 'Parent Communication', 'Differentiated Instruction'],
        experience: '1-3 years',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Marketing & Sales Jobs
    {
        title: 'Digital Marketing Manager',
        company: 'BrandBoost Marketing',
        location: 'Los Angeles, CA',
        type: 'Full-time',
        category: 'Marketing',
        salary: '$85,000 - $120,000',
        description: 'Lead digital marketing campaigns across multiple channels. Develop strategies to increase brand awareness and drive conversions.',
        requirements: [
            'Bachelor\'s degree in Marketing or related field',
            '5+ years of digital marketing experience',
            'Strong analytical skills',
            'Experience with marketing automation tools'
        ],
        skills: ['SEO', 'SEM', 'Social Media Marketing', 'Google Analytics', 'Content Marketing', 'Email Marketing'],
        experience: '5+ years',
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'Sales Representative',
        company: 'SalesPro Solutions',
        location: 'Miami, FL',
        type: 'Full-time',
        category: 'Sales',
        salary: '$50,000 - $80,000 + Commission',
        description: 'Build relationships with clients and drive sales growth. Meet and exceed sales targets through effective communication.',
        requirements: [
            'Bachelor\'s degree preferred',
            'Proven sales track record',
            'Excellent communication skills',
            'Self-motivated and goal-oriented'
        ],
        skills: ['Sales Strategy', 'Client Relations', 'Negotiation', 'CRM Software', 'Presentation Skills'],
        experience: '2+ years',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Finance & Accounting Jobs
    {
        title: 'Financial Analyst',
        company: 'Capital Investments Group',
        location: 'New York, NY',
        type: 'Full-time',
        category: 'Finance',
        salary: '$75,000 - $110,000',
        description: 'Analyze financial data, create reports, and provide insights to support business decisions and investment strategies.',
        requirements: [
            'Bachelor\'s degree in Finance or Accounting',
            'Strong analytical and quantitative skills',
            'Proficiency in Excel and financial modeling',
            'CFA or CPA preferred'
        ],
        skills: ['Financial Modeling', 'Excel', 'Data Analysis', 'Forecasting', 'Risk Assessment', 'Bloomberg Terminal'],
        experience: '3+ years',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'Accountant',
        company: 'Smith & Associates CPA',
        location: 'Dallas, TX',
        type: 'Full-time',
        category: 'Finance',
        salary: '$60,000 - $85,000',
        description: 'Manage financial records, prepare tax returns, and ensure compliance with accounting standards.',
        requirements: [
            'Bachelor\'s degree in Accounting',
            'CPA certification preferred',
            'Knowledge of GAAP',
            'Attention to detail'
        ],
        skills: ['QuickBooks', 'Tax Preparation', 'Financial Reporting', 'Auditing', 'Excel', 'GAAP'],
        experience: '2-4 years',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Engineering (Non-IT) Jobs
    {
        title: 'Mechanical Engineer',
        company: 'Precision Manufacturing Co',
        location: 'Detroit, MI',
        type: 'Full-time',
        category: 'Engineering',
        salary: '$75,000 - $105,000',
        description: 'Design and develop mechanical systems and components for manufacturing equipment. Work on innovative projects.',
        requirements: [
            'Bachelor\'s degree in Mechanical Engineering',
            'PE license preferred',
            'CAD software proficiency',
            'Strong problem-solving skills'
        ],
        skills: ['AutoCAD', 'SolidWorks', 'FEA', 'Manufacturing Processes', 'Project Management', 'Technical Drawing'],
        experience: '3+ years',
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'Civil Engineer',
        company: 'BuildRight Construction',
        location: 'Phoenix, AZ',
        type: 'Full-time',
        category: 'Engineering',
        salary: '$70,000 - $100,000',
        description: 'Plan, design, and oversee construction projects including roads, bridges, and buildings.',
        requirements: [
            'Bachelor\'s degree in Civil Engineering',
            'PE license required',
            'Experience with infrastructure projects',
            'Strong technical and communication skills'
        ],
        skills: ['AutoCAD', 'Civil 3D', 'Project Management', 'Structural Analysis', 'Site Planning', 'Construction Management'],
        experience: '4+ years',
        deadline: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Hospitality & Tourism Jobs
    {
        title: 'Hotel Manager',
        company: 'Grand Plaza Hotel',
        location: 'Las Vegas, NV',
        type: 'Full-time',
        category: 'Hospitality',
        salary: '$65,000 - $90,000',
        description: 'Oversee daily hotel operations, manage staff, and ensure exceptional guest experiences.',
        requirements: [
            'Bachelor\'s degree in Hospitality Management',
            '5+ years of hotel management experience',
            'Strong leadership skills',
            'Customer service excellence'
        ],
        skills: ['Hotel Operations', 'Staff Management', 'Customer Service', 'Budgeting', 'Revenue Management', 'Conflict Resolution'],
        experience: '5+ years',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'Executive Chef',
        company: 'Gourmet Bistro',
        location: 'San Diego, CA',
        type: 'Full-time',
        category: 'Hospitality',
        salary: '$60,000 - $85,000',
        description: 'Lead kitchen operations, create innovative menus, and maintain high culinary standards.',
        requirements: [
            'Culinary degree or equivalent experience',
            '7+ years of culinary experience',
            'Strong leadership and creativity',
            'Food safety certification'
        ],
        skills: ['Menu Development', 'Kitchen Management', 'Food Safety', 'Cost Control', 'Team Leadership', 'Culinary Arts'],
        experience: '7+ years',
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Customer Service Jobs
    {
        title: 'Customer Service Representative',
        company: 'ServiceFirst Solutions',
        location: 'Remote',
        type: 'Full-time',
        category: 'Customer Service',
        salary: '$35,000 - $50,000',
        description: 'Provide excellent customer support via phone, email, and chat. Resolve customer issues efficiently.',
        requirements: [
            'High school diploma or equivalent',
            'Strong communication skills',
            'Problem-solving abilities',
            'Computer proficiency'
        ],
        skills: ['Customer Support', 'Communication', 'Problem Solving', 'CRM Software', 'Active Listening', 'Multitasking'],
        experience: '1-2 years',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Human Resources Jobs
    {
        title: 'HR Manager',
        company: 'TalentHub Inc',
        location: 'Atlanta, GA',
        type: 'Full-time',
        category: 'Human Resources',
        salary: '$70,000 - $95,000',
        description: 'Manage HR operations including recruitment, employee relations, and performance management.',
        requirements: [
            'Bachelor\'s degree in HR or related field',
            'SHRM or HRCI certification preferred',
            '5+ years of HR experience',
            'Strong interpersonal skills'
        ],
        skills: ['Recruitment', 'Employee Relations', 'Performance Management', 'HRIS', 'Compliance', 'Training & Development'],
        experience: '5+ years',
        deadline: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Legal Jobs
    {
        title: 'Paralegal',
        company: 'Johnson & Partners Law Firm',
        location: 'Washington, DC',
        type: 'Full-time',
        category: 'Legal',
        salary: '$50,000 - $70,000',
        description: 'Assist attorneys with legal research, document preparation, and case management.',
        requirements: [
            'Paralegal certificate or degree',
            'Strong research and writing skills',
            'Knowledge of legal procedures',
            'Attention to detail'
        ],
        skills: ['Legal Research', 'Document Drafting', 'Case Management', 'Litigation Support', 'Legal Software', 'Communication'],
        experience: '2-4 years',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Retail Jobs
    {
        title: 'Store Manager',
        company: 'Fashion Forward Retail',
        location: 'Orlando, FL',
        type: 'Full-time',
        category: 'Retail',
        salary: '$45,000 - $65,000',
        description: 'Manage store operations, lead sales team, and ensure excellent customer experiences.',
        requirements: [
            'High school diploma or equivalent',
            '3+ years of retail management experience',
            'Strong leadership skills',
            'Sales-driven mindset'
        ],
        skills: ['Retail Management', 'Sales', 'Inventory Management', 'Team Leadership', 'Customer Service', 'Visual Merchandising'],
        experience: '3+ years',
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        isActive: true
    },

    // Internships
    {
        title: 'Software Engineering Intern',
        company: 'StartupTech',
        location: 'San Francisco, CA',
        type: 'Internship',
        category: 'IT & Technology',
        salary: '$25/hour',
        description: 'Gain hands-on experience in software development. Work on real projects with mentorship from senior engineers.',
        requirements: [
            'Currently pursuing Computer Science degree',
            'Basic programming knowledge',
            'Eagerness to learn',
            'Good communication skills'
        ],
        skills: ['JavaScript', 'Python', 'Git', 'Problem Solving', 'Teamwork'],
        experience: 'Entry Level',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        isActive: true
    },
    {
        title: 'Marketing Intern',
        company: 'Creative Agency Co',
        location: 'New York, NY',
        type: 'Internship',
        category: 'Marketing',
        salary: '$20/hour',
        description: 'Support marketing campaigns, create content, and learn about digital marketing strategies.',
        requirements: [
            'Currently pursuing Marketing or related degree',
            'Social media savvy',
            'Creative mindset',
            'Strong writing skills'
        ],
        skills: ['Social Media', 'Content Creation', 'Canva', 'Communication', 'Research'],
        experience: 'Entry Level',
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        isActive: true
    }
];

// Seed Function
async function seedJobs() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Clear existing jobs
        await Job.deleteMany({});
        console.log('🗑️  Cleared existing jobs');

        // Insert new jobs
        const insertedJobs = await Job.insertMany(jobs);
        console.log(`✅ Successfully seeded ${insertedJobs.length} jobs!`);

        // Display summary by category
        const categories = {};
        insertedJobs.forEach(job => {
            categories[job.category] = (categories[job.category] || 0) + 1;
        });

        console.log('\n📊 Jobs by Category:');
        Object.entries(categories).forEach(([category, count]) => {
            console.log(`   ${category}: ${count} jobs`);
        });

        console.log('\n🎉 Database seeding completed successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run the seed function
seedJobs();
