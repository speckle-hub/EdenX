const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class Rule34VideoScraper extends BaseScraper {
    constructor() {
        super('Rule34Video', 'hentai', 'https://rule34video.com');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/latest/${page}`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('.item, .video-item, article').each((_, el) => {
            const $el = $(el);
            const title = $el.find('a.video_name, h3 a, .title a').text().trim()
                || $el.find('a').attr('title');
            const href = $el.find('a.video_name, h3 a, .title a').attr('href')
                || $el.find('a').first().attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');
            const duration = parseDuration($el.find('.duration, .time').text());

            if (href && title) {
                const embedUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
                videos.push(this.buildVideo({
                    title,
                    embedUrl,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                    tags: ['Hentai', 'Rule34'],
                }));
            }
        });

        return videos;
    }
}

module.exports = Rule34VideoScraper;
