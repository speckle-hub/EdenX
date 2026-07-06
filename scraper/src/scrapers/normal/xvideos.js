const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class XvideosScraper extends BaseScraper {
    constructor() {
        super('xVideos', 'normal', 'https://www.xvideos.com');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/best/${page}/month`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('.mozaique .thumb-block, #video-advent-thumb-block-default .thumb-block').each((_, el) => {
            const $el = $(el);
            const title = $el.find('.thumb-under a').attr('title') || $el.find('.thumb-under a').text().trim();
            const href = $el.find('.thumb-under a').attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');
            const duration = parseDuration($el.find('.duration').text());
            const rating = parseFloat($el.find('.rating-average').text()) || 0;

            if (href && title) {
                const videoId = href.split('/').pop();
                const embedUrl = `https://www.xvideos.com/embedframe/${videoId}`;

                videos.push(this.buildVideo({
                    title,
                    embedUrl,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                    rating: Math.round(rating * 20),
                }));
            }
        });

        return videos;
    }
}

module.exports = XvideosScraper;
