const fs = require('fs');
const path = require('path');

const dataJsPath = path.join(__dirname, 'website', 'js', 'data.js');
const pornstarsJsonPath = path.join(__dirname, 'website', 'data', 'pornstars.json');

let content = fs.readFileSync(dataJsPath, 'utf8');

// Find the PORNSTARS array
const startIdx = content.indexOf('const PORNSTARS = [');
if (startIdx !== -1) {
    const endIdx = content.indexOf('];', startIdx) + 2;
    const arrayStr = content.substring(startIdx, endIdx);
    
    // Evaluate it so we can write it as clean JSON
    // We can just use eval since it's our own static code
    const evalCode = arrayStr + '\nmodule.exports = PORNSTARS;';
    fs.writeFileSync('temp.js', evalCode);
    const pornstars = require('./temp.js');
    fs.unlinkSync('temp.js');

    fs.writeFileSync(pornstarsJsonPath, JSON.stringify({ pornstars }, null, 2));

    // Update data.js to load pornstars
    let newContent = content.substring(0, startIdx);
    newContent += `let PORNSTARS = [];\n\n`;
    newContent += content.substring(endIdx);

    // Update loadAllData in data.js to load pornstars
    newContent = newContent.replace('const results = await Promise.all(categories.map(loadCat));', 
`    const results = await Promise.all(categories.map(loadCat));
    try {
        const psRes = await fetch('data/pornstars.json');
        if (psRes.ok) {
            const psData = await psRes.json();
            PORNSTARS = psData.pornstars || [];
        }
    } catch(e) { console.error(e); }`);

    fs.writeFileSync(dataJsPath, newContent);
    console.log('Successfully extracted pornstars to JSON and updated data.js');
}
