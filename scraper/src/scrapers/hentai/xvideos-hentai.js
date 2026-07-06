const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class XvideosHentaiScraper extends BaseScraper {
    constructor() {
        super('xVideos Hentai', 'hentai', 'https://www.xvideos.com');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/categories/hentai-video?page=${page}`;
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
                videos.push(this.buildVideo({
                    title,
                    embedUrl: `https://www.xvideos.com/embedframe/${videoId}`,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                    tags: ['Hentai'],
                }));
            }
        });

        return videos;
    }
}

module.exports = XvideosHentaiScraper;
