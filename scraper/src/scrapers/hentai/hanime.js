const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class HanimeScraper extends BaseScraper {
    constructor() {
        super('Hanime', 'hentai', 'https://hanime.tv');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/hentai?page=${page}`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('.eplister li, .video-card, div[class*="video"]').each((_, el) => {
            const $el = $(el);
            const title = $el.find('h2, .entry-title, .video-title').text().trim()
                || $el.find('a').attr('title');
            const href = $el.find('a').attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');
            const duration = parseDuration($el.find('.duration, .ep-duration').text());

            if (href && title) {
                const embedUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                videos.push(this.buildVideo({
                    title,
                    embedUrl,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                    tags: ['Hentai', 'Anime'],
                }));
            }
        });

        return videos;
    }
}

module.exports = HanimeScraper;
