const BaseScraper = require('../../base-scraper');
const { parseDuration, parseViews } = require('../../utils');

/**
 * XNXX JAV fallback scraper.
 * Reuses XNXX (which works reliably) but searches with "Japanese" appended,
 * so results are JAV-focused. Category is set to 'jav'.
 */
class XnxxJavScraper extends BaseScraper {
    constructor() {
        super('XNXX JAV', 'jav', 'https://www.xnxx.com');
    }

    getSearchUrl(query, page) {
        // Append "Japanese" to ensure JAV results
        const javQuery = `${query} Japanese`;
        return `${this.baseUrl}/search/${encodeURIComponent(javQuery)}/${page}`;
    }

    getPageUrl(page) {
        return `${this.baseUrl}/search/japanese+milf/${page}`;
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
                    views: parseViews($el.find('.views').text()),
                    tags: ['JAV', 'Japanese', 'Asian'],
                }));
            }
        });

        return videos;
    }
}

module.exports = XnxxJavScraper;
