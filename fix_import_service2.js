const fs = require('fs');
const file = 'backend/src/services/import/bookImportService.js';
let content = fs.readFileSync(file, 'utf8');

const oldLogic = `    let parsedYear = null;
    if (work.first_publish_date) {
        const match = String(work.first_publish_date).match(/\\b(1\\d{3}|20\\d{2})\\b/);
        if (match) {
            parsedYear = parseInt(match[0], 10);
        }
    }`;

const newLogic = `    let parsedYear = null;
    if (work.first_publish_date) {
        const match = String(work.first_publish_date).match(/\\b(1\\d{3}|20\\d{2})\\b/);
        if (match) {
            parsedYear = parseInt(match[0], 10);
        }
    }
    
    // Fallback: Many OpenLibrary works lack first_publish_date but their editions have publish_date
    if (!parsedYear) {
        try {
            const editionsData = await openLibraryService.getWorkEditions(workKey, 5, 0);
            if (editionsData && Array.isArray(editionsData.entries)) {
                for (const edition of editionsData.entries) {
                    if (edition.publish_date) {
                        const match = String(edition.publish_date).match(/\\b(1\\d{3}|20\\d{2})\\b/);
                        if (match) {
                            parsedYear = parseInt(match[0], 10);
                            break;
                        }
                    }
                }
            }
        } catch (err) {
            console.error(\`Failed to fetch editions for year fallback on work \${workKey}\`, err.message);
        }
    }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(file, content, 'utf8');
console.log('Added edition fallback to bookImportService.js');
