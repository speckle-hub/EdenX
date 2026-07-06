const BaseScraper = require('../../base-scraper');
const { parseDuration , parseViews} = require('../../utils');

class MissavScraper extends BaseScraper {
    constructor() {
        super('MissAV', 'jav', 'https://missav.ws');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/genres/av-idol`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('a[href*="/"]').each((_, el) => {
            const $el = $(el);
            const title = $el.attr('title') || $el.text().trim();
            const href = $el.attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');

            if (href && title && title.length > 5 && (href.includes('/dm') || href.includes('/av'))) {
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

module.exports = MissavScraper;
