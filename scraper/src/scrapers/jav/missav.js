const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class MissavScraper extends BaseScraper {
    constructor() {
        super('MissAV', 'jav', 'https://missav.ws');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/new?page=${page}`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('div[class*="video-card"], article, .thumbnail').each((_, el) => {
            const $el = $(el);
            const title = $el.find('a').attr('title') || $el.find('h3, .title, .name').text().trim();
            const href = $el.find('a').attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');
            const duration = parseDuration($el.find('.duration, .time').text());

            if (href && title) {
                const embedUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                videos.push(this.buildVideo({
                    title,
                    embedUrl,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                    tags: ['JAV', 'Japanese'],
                }));
            }
        });

        return videos;
    }
}

module.exports = MissavScraper;
