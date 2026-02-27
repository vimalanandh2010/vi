const fs = require('fs');
const path = require('path');

const directory = 'd:/job portal/frontend/src';

const replacements = [
    { old: /recruiter_token/g, new: 'recruiterToken' },
    { old: /jobseeker_token/g, new: 'seekerToken' }
];

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            processDirectory(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            for (const replacement of replacements) {
                if (replacement.old.test(content)) {
                    content = content.replace(replacement.old, replacement.new);
                    changed = true;
                }
            }

            if (changed) {
                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated: ${fullPath}`);
            }
        }
    }
}

processDirectory(directory);
console.log('Token standardization complete.');
