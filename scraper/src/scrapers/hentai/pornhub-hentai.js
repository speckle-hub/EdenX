const BaseScraper = require('../../base-scraper');
const { parseDuration , parseViews} = require('../../utils');

class PornhubHentaiScraper extends BaseScraper {
    constructor() {
        super('Pornhub Hentai', 'hentai', 'https://www.pornhub.com');
    }

    async scrape(pagesToScrape = 3) {
        console.log(`\n[${this.name}] Starting hentai scrape...`);
        const allVideos = [];
        const pages = ['hentai', 'anime', 'cartoon'];

        for (const tag of pages) {
            for (let page = 1; page <= pagesToScrape; page++) {
                console.log(`  [${this.name}] ${tag} page ${page}/${pagesToScrape}...`);
                const $ = await this.fetchPage(`${this.baseUrl}/video?p=${page}&tags=${tag}&search=`);
                if (!$) continue;

                const videos = [];
                $('li.videoblock, .videoBox').each((_, el) => {
                    const $el = $(el);
                    const a = $el.find('a[href*="/view_video"]');
                    const title = a.attr('title') || a.text().trim();
                    const href = a.attr('href');
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
                                views: parseViews($el.find('.views, .video-views, .views-info').text()),
                }));
                        }
                    }
                });

                if (!videos.length) break;
                allVideos.push(...videos);
                console.log(`  [${this.name}] Got ${videos.length} (total: ${allVideos.length})`);
            }
        }

        console.log(`  [${this.name}] Done. ${allVideos.length} videos.`);
        return allVideos;
    }
}

module.exports = PornhubHentaiScraper;
