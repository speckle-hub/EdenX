const BaseScraper = require('../../base-scraper');
const { parseDuration, parseViews } = require('../../utils');

/**
 * xVideos JAV fallback scraper.
 * Reuses xVideos (which works reliably) but searches with "Japanese" appended,
 * so results are JAV-focused. Category is set to 'jav'.
 */
class XvideosJavScraper extends BaseScraper {
    constructor() {
        super('xVideos JAV', 'jav', 'https://www.xvideos.com');
    }

    getSearchUrl(query, page) {
        // Append "Japanese" to ensure JAV results
        const javQuery = `${query} Japanese`;
        return `${this.baseUrl}/?k=${encodeURIComponent(javQuery)}&p=${page}`;
    }

    getPageUrl(page) {
        return `${this.baseUrl}/?k=japanese+milf&p=${page}`;
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

            if (href && title) {
                const videoId = href.split('/').pop();
                const embedUrl = `https://www.xvideos.com/embedframe/${videoId}`;

                videos.push(this.buildVideo({
                    title,
                    embedUrl,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                    views: parseViews($el.find('.rating-average, .views').text()),
                    tags: ['JAV', 'Japanese', 'Asian'],
                }));
            }
        });

        return videos;
    }
}

module.exports = XvideosJavScraper;
