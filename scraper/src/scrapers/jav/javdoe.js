const BaseScraper = require('../../base-scraper');
const { parseDuration, parseViews } = require('../../utils');

/**
 * JavDoe scraper — lightweight JAV site, no Cloudflare, clean HTML.
 * Search URL: https://javdoe.sh/search/<query>/1/
 * Video pages use standard iframe embeds.
 */
class JavDoeScraper extends BaseScraper {
    constructor() {
        super('JavDoe', 'jav', 'https://javdoe.sh');
    }

    getSearchUrl(query, page) {
        // JavDoe search uses ?s= query param and &paged= for pagination
        return `${this.baseUrl}/?s=${encodeURIComponent(query)}&paged=${page}`;
    }

    getPageUrl(page) {
        // Generic recent JAV listing
        return `${this.baseUrl}/page/${page}/`;
    }

    async scrapePage(url) {
        const $ = await this.fetchPage(url);
        if (!$) return [];

        const videos = [];

        // JavDoe video cards: .box-item
        $('.box-item, .video-item, article.item').each((_, el) => {
            const $el = $(el);

            const $link = $el.find('a[href*="/video/"], a[href*="/jav/"]').first();
            const href = $link.attr('href') || $el.find('a').first().attr('href');
            const title = $el.find('.title, h3, h2, .video-title').text().trim()
                || $link.attr('title') || '';
            const thumbnail = $el.find('img').attr('data-src')
                || $el.find('img').attr('src') || '';
            const durationText = $el.find('.duration, .time, .length').text().trim();
            const viewsText = $el.find('.views, .view, .count').text().trim();

            if (!href || title.length < 3) return;

            // Build embed URL — JavDoe uses /embed/<id>/ pattern
            let embedUrl = '';
            const idMatch = href.match(/\/(video|jav)\/([a-zA-Z0-9\-_]+)/);
            if (idMatch) {
                embedUrl = `${this.baseUrl}/embed/${idMatch[2]}/`;
            } else {
                embedUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`;
            }

            videos.push(this.buildVideo({
                title,
                embedUrl,
                thumbnail: thumbnail.startsWith('http') ? thumbnail : '',
                duration: parseDuration(durationText),
                views: parseViews(viewsText),
                tags: ['JAV', 'Japanese', 'Asian'],
            }));
        });

        return videos;
    }
}

module.exports = JavDoeScraper;
