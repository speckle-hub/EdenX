const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class Rule34VideoScraper extends BaseScraper {
    constructor() {
        super('Rule34Video', 'hentai', 'https://rule34video.com');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/videos/?sort_by=date&page=${page}`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('div.video-thumb, .item').each((_, el) => {
            const $el = $(el);
            const a = $el.find('a').first();
            const title = a.attr('title') || a.text().trim();
            const href = a.attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');
            const duration = parseDuration($el.find('.duration, .time').text());

            if (href && title) {
                videos.push(this.buildVideo({
                    title,
                    embedUrl: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                    tags: ['Hentai', 'Rule34'],
                }));
            }
        });

        return videos;
    }
}

module.exports = Rule34VideoScraper;
