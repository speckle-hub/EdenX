const BaseScraper = require('../../base-scraper');
const { parseDuration } = require('../../utils');

class PornhubJavScraper extends BaseScraper {
    constructor() {
        super('Pornhub JAV', 'jav', 'https://www.pornhub.com');
    }

    async scrape(pagesToScrape = 5) {
        console.log(`\n[${this.name}] Starting JAV scrape...`);
        const allVideos = [];
        const categories = ['jav', 'japanese', 'asian'];

        for (const cat of categories) {
            for (let page = 1; page <= pagesToScrape; page++) {
                console.log(`  [${this.name}] ${cat} page ${page}/${pagesToScrape}...`);
                const $ = await this.fetchPage(`${this.baseUrl}/video?category=${cat}&page=${page}`);
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
                                tags: ['JAV', 'Japanese'],
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

module.exports = PornhubJavScraper;
