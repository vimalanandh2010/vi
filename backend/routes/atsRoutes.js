const express = require('express');
const router = express.Router();
const atsController = require('../controllers/atsController');

// @route   POST /api/ats/run-engine
// @desc    Run the local ATS engine on a resume URL
router.post('/run-engine', atsController.runEngine);

// @route   POST /api/ats/run-advanced
// @desc    Run the advanced AI ATS analyzer on a resume URL and JD
router.post('/run-advanced', atsController.runAdvancedAnalysis);

module.exports = router;
