const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class RedtubeScraper extends BaseScraper {
    constructor() {
        super('RedTube', 'normal', 'https://www.redtube.com');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/newest?page=${page}`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];
        $('li.nf-item, div.video_container').each((_, el) => {
            const $el = $(el);
            const title = $el.find('a.video-link, h2 a').attr('title') || $el.find('a.video-link, h2 a').text().trim();
            const href = $el.find('a.video-link, h2 a').attr('href');
            const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');
            const duration = parseDuration($el.find('.duration, span.video_duration').text());

            if (href && title) {
                const slug = href.replace(/\//g, '-').replace(/^-|-$/g, '');
                const videoId = $el.attr('data-video-id') || slug;
                const embedUrl = `https://embed.redtube.com/?id=${videoId}`;

                videos.push(this.buildVideo({
                    title,
                    embedUrl: href.startsWith('http') ? embedUrl : `https://embed.redtube.com/?id=${videoId}`,
                    thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                    duration,
                }));
            }
        });

        return videos;
    }
}

module.exports = RedtubeScraper;
