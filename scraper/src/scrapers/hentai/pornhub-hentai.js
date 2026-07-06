const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class PornhubHentaiScraper extends BaseScraper {
    constructor() {
        super('Pornhub Hentai', 'hentai', 'https://www.pornhub.com');
    }

    getPageUrl(page) {
        return `${this.baseUrl}/pornstars/most-subscribed?category=hentai&page=${page}`;
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
                    tags: ['Hentai'],
                }));
            }
        });

        return videos;
    }

    async scrape(pagesToScrape = 5) {
        console.log(`\n[${this.name}] Starting hentai scrape...`);
        const allVideos = [];
        const urls = [
            `${this.baseUrl}/video?category=hentai&page=`,
            `${this.baseUrl}/video?category=anime&page=`,
        ];

        for (const baseUrl of urls) {
            for (let page = 1; page <= pagesToScrape; page++) {
                console.log(`  [${this.name}] Page ${page}/${pagesToScrape}...`);
                const $ = await this.fetchPage(`${baseUrl}${page}`);
                if (!$) continue;

                const videos = [];
                $('.videoBox, li.videoblock').each((_, el) => {
                    const $el = $(el);
                    const title = $el.find('a[href^="/view_video"] span.title').attr('title')
                        || $el.find('a[href^="/view_video"]').text().trim();
                    const href = $el.find('a[href^="/view_video"]').attr('href');
                    const thumbnail = $el.find('img').attr('data-src') || $el.find('img').attr('src');
                    const duration = parseDuration($el.find('.duration').text());

                    if (href && title) {
                        const videoId = href.match(/view_video=(\d+)/)?.[1];
                        if (videoId) {
                            videos.push(this.buildVideo({
                                title,
                                embedUrl: `https://www.pornhub.com/embed/${videoId}`,
                                thumbnail: thumbnail?.startsWith('http') ? thumbnail : '',
                                duration,
                                tags: ['Hentai'],
                            }));
                        }
                    }
                });

                if (videos.length === 0) break;
                allVideos.push(...videos);
                console.log(`  [${this.name}] Got ${videos.length} videos (total: ${allVideos.length})`);
            }
        }

        console.log(`  [${this.name}] Done. ${allVideos.length} videos scraped.`);
        return allVideos;
    }
}

module.exports = PornhubHentaiScraper;
