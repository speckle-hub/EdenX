const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'scrapers');

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Add parseViews to import
            if (content.includes("const { parseDuration") && !content.includes("parseViews")) {
                content = content.replace(/const {([^}]+)} = require\('\.\.\/\.\.\/utils'\);/, (match, p1) => {
                    return `const {${p1}, parseViews} = require('../../utils');`;
                });
            } else if (!content.includes("../../utils") && !content.includes("parseViews")) {
                content = content.replace(/(const BaseScraper = [^\n]+)/, `$1\nconst { parseViews } = require('../../utils');`);
            }

            // Simple injection to try extracting views if we don't have it
            if (!content.includes('const views =') && !content.includes('views:')) {
                // Find where we build video
                content = content.replace(/(this\.buildVideo\(\{\s*[\s\S]+?)(\}\)\);)/, (match, p1, p2) => {
                    if (p1.includes('views:')) return match;
                    return p1 + `    views: parseViews($el.find('.views, .video-views, .views-info').text()),\n                ` + p2;
                });
            }

            fs.writeFileSync(fullPath, content);
            console.log('Updated ' + file);
        }
    }
}

processDir(baseDir);
console.log('Done');
