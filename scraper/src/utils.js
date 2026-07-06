const crypto = require('crypto');

function generateId(url) {
    return crypto.createHash('md5').update(url).digest('hex').slice(0, 12);
}

function parseDuration(str) {
    if (!str) return 0;
    const parts = str.trim().split(':').map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
}

function cleanText(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min = 1000, max = 3000) {
    return delay(min + Math.random() * (max - min));
}

function parseViews(str) {
    if (!str) return 0;
    let s = str.trim().toUpperCase().replace(/,/g, '');
    let mult = 1;
    if (s.endsWith('M')) { mult = 1000000; s = s.slice(0, -1); }
    else if (s.endsWith('K')) { mult = 1000; s = s.slice(0, -1); }
    else if (s.endsWith('B')) { mult = 1000000000; s = s.slice(0, -1); }
    
    // Some sites have views like "1 million" or "views: 1000"
    const match = s.match(/[\d\.]+/);
    if (match) {
        return Math.floor(parseFloat(match[0]) * mult);
    }
    return 0;
}

module.exports = { generateId, parseDuration, cleanText, delay, randomDelay, parseViews };
