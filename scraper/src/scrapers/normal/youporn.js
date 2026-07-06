const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class YoupornScraper extends BaseScraper {
    constructor() {
        super('YouPorn', 'normal', 'https://www.youporn.com');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/hot/${page}`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('.video-box, article.video-box').each((_, el) => {
            const $el = $(el);
            const title = $el.find('a.video-link').attr('title') || $el.find('a.video-link').text().trim();
            const href = $el.find('a.video-link').attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');
            const duration = parseDuration($el.find('.duration, span.video-duration').text());

            if (href && title) {
                const videoId = href.match(/\/(\d+)\//)?.[1];
                const embedUrl = videoId
                    ? `https://www.youporn.com/embed/${videoId}`
                    : `https://www.youporn.com${href}`;

                videos.push(this.buildVideo({
                    title,
                    embedUrl,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                }));
            }
        });

        return videos;
    }
}

module.exports = YoupornScraper;
