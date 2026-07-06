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
            
            // Avoid double insertion
            if (content.includes('getSearchUrl(')) continue;

            let searchUrlStr = '';
            
            if (file === 'pornhub.js' || file === 'pornhub-hentai.js' || file === 'pornhub-jav.js') {
                searchUrlStr = `\n    getSearchUrl(query, page) {\n        return \`\${this.baseUrl}/video/search?search=\${encodeURIComponent(query)}&page=\${page}\`;\n    }\n`;
            } else if (file === 'xvideos.js' || file === 'xvideos-hentai.js') {
                searchUrlStr = `\n    getSearchUrl(query, page) {\n        return \`\${this.baseUrl}/?k=\${encodeURIComponent(query)}&p=\${page}\`;\n    }\n`;
            } else if (file === 'xnxx.js') {
                searchUrlStr = `\n    getSearchUrl(query, page) {\n        return \`\${this.baseUrl}/search/\${encodeURIComponent(query)}/\${page}\`;\n    }\n`;
            } else if (file === 'xhamster.js') {
                searchUrlStr = `\n    getSearchUrl(query, page) {\n        return \`\${this.baseUrl}/search/\${encodeURIComponent(query)}?page=\${page}\`;\n    }\n`;
            } else {
                // Generic fallback
                searchUrlStr = `\n    getSearchUrl(query, page) {\n        return \`\${this.baseUrl}/search?q=\${encodeURIComponent(query)}&page=\${page}\`;\n    }\n`;
            }

            content = content.replace(/(getPageUrl\([^)]+\)\s*\{[^}]+\})/, (match) => {
                return searchUrlStr + '\n    ' + match;
            });

            fs.writeFileSync(fullPath, content);
            console.log('Added search to ' + file);
        }
    }
}

processDir(baseDir);
console.log('Done adding search urls');
