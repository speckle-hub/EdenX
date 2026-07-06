const BaseScraper = require('../../base-scraper');
const { parseDuration , parseViews} = require('../../utils');

class HanimeScraper extends BaseScraper {
    constructor() {
        super('Hanime', 'hentai', 'https://hanime.tv');
    }

    
    getSearchUrl(query, page) {
        return `${this.baseUrl}/search?q=${encodeURIComponent(query)}&page=${page}`;
    }

    getPageUrl(page) {
        return `${this.baseUrl}/hentai/videos`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('a[href*="/hentai/"]').each((_, el) => {
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
                    tags: ['Hentai', 'Anime'],
                    views: parseViews($el.find('.views, .video-views, .views-info').text()),
                }));
            }
        });

        return videos;
    }
}

module.exports = HanimeScraper;
