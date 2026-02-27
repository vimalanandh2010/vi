const Company = require('../models/Company');
const User = require('../models/User');

// @desc    Create a new company
// @route   POST /api/companies
// @access  Private (Employer)
exports.createCompany = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const { name, logo, about, companyType, industries, size, location, website } = req.body;

        const newCompany = new Company({
            name,
            logo,
            about,
            companyType,
            industries,
            size,
            location,
            website,
            createdBy: req.user.id
        });

        const company = await newCompany.save();

        // Update user to link this company
        await User.findByIdAndUpdate(req.user.id, { company: company._id, companyName: company.name });

        res.status(201).json(company);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Update company details
// @route   PUT /api/companies/:id
// @access  Private (Employer Owner)
exports.updateCompany = async (req, res) => {
    try {
        let company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        // Check ownership
        if (company.createdBy.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }

        company = await Company.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(company);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get all companies with filters
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res) => {
    try {
        const { type, industry, location, search, skills } = req.query;
        let query = {};

        if (type) query.companyType = type;
        if (industry) query.industries = { $in: [industry] };
        if (location) query.location = new RegExp(location, 'i');
        if (search) query.name = new RegExp(search, 'i');

        if (skills) {
            const Job = require('../models/Job');
            const skillArray = skills.split(',').map(s => s.trim()).filter(s => s);

            // Find companies that have jobs matching these skills
            if (skillArray.length > 0) {
                const matchingJobs = await Job.find({
                    tags: { $in: skillArray.map(s => new RegExp(s, 'i')) },
                    status: 'active'
                }).select('company');

                const companyIds = matchingJobs.map(j => j.company);
                query._id = { $in: companyIds };
            }
        }

        const companies = await Company.find(query).sort({ createdAt: -1 });
        res.json(companies);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get company by ID
// @route   GET /api/companies/:id
// @access  Public
exports.getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);

        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }

        res.json(company);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Get current user's company
// @route   GET /api/companies/my-company
// @access  Private (Employer)
exports.getMyCompany = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        let company = null;
        if (user.company) {
            company = await Company.findById(user.company);
        }

        if (!company) {
            company = await Company.findOne({ createdBy: req.user.id });
        }

        if (!company) {
            return res.json(null);
        }

        res.json(company);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create or Update company (Upsert)
// @route   PUT /api/companies/update
// @access  Private (Employer)
exports.upsertCompany = async (req, res) => {
    try {
        if (req.user.role !== 'employer') {
            return res.status(403).json({ message: 'Access denied. Employers only.' });
        }

        const { name, logo, about, companyType, industries, size, location, website } = req.body;
        const companyFields = {
            name,
            logo,
            about,
            companyType,
            industries,
            size,
            location,
            website,
            createdBy: req.user.id
        };

        // Check if company exists for this user
        let company = await Company.findOne({ createdBy: req.user.id });

        if (company) {
            // Update
            company = await Company.findOneAndUpdate(
                { createdBy: req.user.id },
                { $set: companyFields },
                { new: true }
            );
        } else {
            // Create
            company = new Company(companyFields);
            await company.save();

            // Link to user
            await User.findByIdAndUpdate(req.user.id, { company: company._id, companyName: company.name });
        }

        res.json(company);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    createCompany: exports.createCompany,
    updateCompany: exports.updateCompany,
    getCompanies: exports.getCompanies,
    getCompanyById: exports.getCompanyById,
    getMyCompany: exports.getMyCompany,
    upsertCompany: exports.upsertCompany
};
