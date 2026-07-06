const BaseScraper = require('../../base-scraper');
const { parseDuration , parseViews} = require('../../utils');

class JavmostScraper extends BaseScraper {
    constructor() {
        super('JavMost', 'jav', 'https://javmost.com');
    }

    
    getSearchUrl(query, page) {
        return `${this.baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}`;
    }

    getPageUrl(page) {
        return `${this.baseUrl}/`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('a[href*="/v/"]').each((_, el) => {
            const $el = $(el);
            const title = $el.attr('title') || $el.text().trim();
            const href = $el.attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');

            if (href && title && title.length > 3) {
                videos.push(this.buildVideo({
                    title,
                    embedUrl: href.startsWith('http') ? href : `${this.baseUrl}${href}`,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration: 0,
                    tags: ['JAV', 'Japanese'],
                    views: parseViews($el.find('.views, .video-views, .views-info').text()),
                }));
            }
        });

        return videos;
    }
}

module.exports = JavmostScraper;
