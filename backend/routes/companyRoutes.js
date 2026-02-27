const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const companyController = require('../controllers/companyController');

// @route   POST /api/companies
// @desc    Create a company
router.post('/', auth, companyController.createCompany);

// @route   PUT /api/companies/update
// @desc    Create or Update company (Upsert)
router.put('/update', auth, companyController.upsertCompany);

// @route   PUT /api/companies/:id
// @desc    Update a company
router.put('/:id', auth, companyController.updateCompany);

// @route   GET /api/companies
// @desc    Get all companies
router.get('/', companyController.getCompanies);

// @route   GET /api/companies/my-company
// @desc    Get current user's company
router.get('/my-company', auth, companyController.getMyCompany);

// @route   GET /api/companies/:id
// @desc    Get company by ID
router.get('/:id', companyController.getCompanyById);

module.exports = router;
