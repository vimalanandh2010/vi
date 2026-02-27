const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
    companyName: { type: String, required: true },
    description: { type: String, default: '' },
    location: { type: String, default: '' },
    website: { type: String, default: '' },
    isVerified: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Employer', employerSchema);
