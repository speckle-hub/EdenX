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

module.exports = { generateId, parseDuration, cleanText, delay, randomDelay };
