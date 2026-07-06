const BaseScraper = require('../../base-scraper');
const { parseDuration, cleanText } = require('../../utils');

class PornhubScraper extends BaseScraper {
    constructor() {
        super('Pornhub', 'normal', 'https://www.pornhub.com');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/video?page=${page}`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('.videoBox, li.videoblock').each((_, el) => {
            const $el = $(el);
            const title = $el.find('a[href^="/view_video"] span.title, a.videoLink').attr('title')
                || $el.find('a[href^="/view_video"]').text().trim();
            const href = $el.find('a[href^="/view_video"]').attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');
            const duration = parseDuration($el.find('.duration, span.duration').text());
            const rating = parseFloat($el.find('.rating-percent span').text()) || 0;

            if (href && title) {
                const videoId = href.match(/view_video=(\d+)/)?.[1];
                const embedUrl = videoId
                    ? `https://www.pornhub.com/embed/${videoId}`
                    : `https://www.pornhub.com${href}`;

                videos.push(this.buildVideo({
                    title,
                    embedUrl,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                    rating: Math.round(rating),
                }));
            }
        });

        return videos;
    }
}

module.exports = PornhubScraper;
