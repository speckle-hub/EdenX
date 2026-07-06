const BaseScraper = require('../../base-scraper');
const { parseDuration , parseViews} = require('../../utils');

class XnxxScraper extends BaseScraper {
    constructor() {
        super('XNXX', 'normal', 'https://www.xnxx.com');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/best/${page}/month`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('.thumb-block, .mozaique .thumb-block').each((_, el) => {
            const $el = $(el);
            const title = $el.find('.thumb-under a').attr('title') || $el.find('.thumb-under a').text().trim();
            const href = $el.find('.thumb-under a').attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');
            const duration = parseDuration($el.find('.duration').text());

            if (href && title) {
                const videoId = href.split('/').pop();
                const embedUrl = `https://www.xnxx.com/embedframe/${videoId}`;

                videos.push(this.buildVideo({
                    title,
                    embedUrl,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                    views: parseViews($el.find('.views, .video-views, .views-info').text()),
                }));
            }
        });

        return videos;
    }
}

module.exports = XnxxScraper;
