const { extractDomain, isPublicEmail } = require('../utils/dnsUtils');

const validateCompanyEmail = (req, res, next) => {
    const { officialEmail, companyWebsite } = req.body;

    if (!officialEmail || !companyWebsite) {
        return res.status(400).json({ message: 'Official email and company website are required' });
    }

    const emailDomain = extractDomain(officialEmail);
    const websiteDomain = extractDomain(companyWebsite);

    if (!emailDomain || !websiteDomain) {
        return res.status(400).json({ message: 'Invalid email or website format' });
    }

    // 1. Block public email providers
    if (isPublicEmail(emailDomain)) {
        return res.status(400).json({
            message: `Public email providers like ${emailDomain} are not allowed for company verification. Please use your official company email.`
        });
    }

    // 2. The email domain must match the company website domain
    if (emailDomain !== websiteDomain) {
        return res.status(400).json({
            message: `Email domain (${emailDomain}) does not match your company website domain (${websiteDomain}).`
        });
    }

    req.verifiedDomains = { emailDomain, websiteDomain };
    next();
};

module.exports = {
    validateCompanyEmail
};
