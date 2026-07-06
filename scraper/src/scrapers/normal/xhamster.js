const BaseScraper = require('../../base-scraper');
const { parseDuration , parseViews} = require('../../utils');

class XhamsterScraper extends BaseScraper {
    constructor() {
        super('xHamster', 'normal', 'https://xhamster.com');
    }

    
    getSearchUrl(query, page) {
        return `${this.baseUrl}/search/${encodeURIComponent(query)}?page=${page}`;
    }

    getPageUrl(page) {
        return `${this.baseUrl}/videos/best/month/${page}`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('.video-thumb-container, div[data-id]').each((_, el) => {
            const $el = $(el);
            const title = $el.find('.video-thumb-info__name, a.video-thumb-info__name').text().trim();
            const href = $el.find('a').attr('href');
            const thumbnail = $el.find('img').attr('src');
            const duration = parseDuration($el.find('.duration, span.video-thumb-info__duration').text());

            if (href && title) {
                const match = href.match(/videos\/(\d+)/);
                const videoId = match?.[1];
                const embedUrl = videoId
                    ? `https://xhamster.com/xembed.php?video=${videoId}`
                    : href;

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

module.exports = XhamsterScraper;
