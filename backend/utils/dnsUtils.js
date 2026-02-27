const dns = require('dns').promises;

/**
 * Extracts the main domain from a URL or email address.
 * @param {string} input - The URL or email address.
 * @returns {string|null} - The extracted domain.
 */
const extractDomain = (input) => {
    if (!input) return null;

    // Handle emails
    if (input.includes('@')) {
        return input.split('@')[1].toLowerCase().trim();
    }

    // Handle URLs
    try {
        let hostname;
        if (input.includes('//')) {
            hostname = new URL(input).hostname;
        } else {
            hostname = new URL('http://' + input).hostname;
        }

        // Remove 'www.' if present
        return hostname.replace(/^www\./, '').toLowerCase().trim();
    } catch (error) {
        return null;
    }
};

/**
 * Checks if a domain has valid MX (Mail Exchange) records.
 * @param {string} domain - The domain to check.
 * @returns {Promise<boolean>} - True if MX records exist.
 */
const hasMXRecord = async (domain) => {
    if (!domain) return false;
    try {
        const records = await dns.resolveMx(domain);
        return records && records.length > 0;
    } catch (error) {
        // Enforce fallback check if resolveMx fails (some domains use A records for mail)
        try {
            const aRecords = await dns.resolve4(domain);
            return aRecords && aRecords.length > 0;
        } catch (e) {
            return false;
        }
    }
};

/**
 * List of common public/free email providers that should be blocked for official company verification.
 */
const FREE_EMAIL_PROVIDERS = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
    'aol.com', 'zoho.com', 'protonmail.com', 'mail.com', 'gmx.com',
    'yandex.com', 'me.com', 'live.com', 'msn.com', 'yahoo.co.in', 'yahoo.co.uk',
    'hotmail.co.uk', 'live.co.uk', 'outlook.co.uk'
];

const isPublicEmail = (domain) => {
    if (!domain) return false;
    return FREE_EMAIL_PROVIDERS.includes(domain.toLowerCase());
};

module.exports = {
    extractDomain,
    hasMXRecord,
    isPublicEmail
};
