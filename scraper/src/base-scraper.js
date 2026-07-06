const axios = require('axios');
const cheerio = require('cheerio');
const { generateId, cleanText, randomDelay } = require('./utils');

class BaseScraper {
    constructor(name, category, baseUrl) {
        this.name = name;
        this.category = category;
        this.baseUrl = baseUrl;
        this.client = axios.create({
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
            },
            timeout: 10000,
        });
    }

    async fetchPage(url) {
        await randomDelay(800, 2500);
        try {
            const { data } = await this.client.get(url);
            return cheerio.load(data);
        } catch (err) {
            console.error(`  [${this.name}] Failed to fetch ${url}: ${err.message}`);
            return null;
        }
    }

    buildVideo(item) {
        return {
            id: generateId(item.embedUrl),
            title: cleanText(item.title),
            embedUrl: item.embedUrl,
            thumbnail: item.thumbnail || '',
            duration: item.duration || 0,
            rating: item.rating || 0,
            pornstars: item.pornstars || [],
            tags: item.tags || [],
            category: this.category,
            source: this.name,
            views: item.views || 0,
        };
    }

    async scrapePage(pageUrl) {
        throw new Error('scrapePage() must be implemented by subclass');
    }

    async scrape(pagesToScrape = 5) {
        console.log(`\n[${this.name}] Starting scrape (${this.category})...`);
        const allVideos = [];

        for (let page = 1; page <= pagesToScrape; page++) {
            console.log(`  [${this.name}] Page ${page}/${pagesToScrape}...`);
            const pageUrl = this.getPageUrl(page);
            const videos = await this.scrapePage(pageUrl, page);
            if (!videos || videos.length === 0) {
                console.log(`  [${this.name}] No results on page ${page}, stopping.`);
                break;
            }
            allVideos.push(...videos);
            console.log(`  [${this.name}] Got ${videos.length} videos (total: ${allVideos.length})`);
        }

        console.log(`  [${this.name}] Done. ${allVideos.length} videos scraped.`);
        return allVideos;
    }

    getPageUrl(page) {
        throw new Error('getPageUrl() must be implemented by subclass');
    }
}

module.exports = BaseScraper;
