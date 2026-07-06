const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class ThisavScraper extends BaseScraper {
    constructor() {
        super('ThisAV', 'jav', 'https://thisav.com');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/new?page=${page}`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('.video-item, article, .thumb').each((_, el) => {
            const $el = $(el);
            const title = $el.find('a').attr('title') || $el.find('h3, .title').text().trim();
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

module.exports = ThisavScraper;
