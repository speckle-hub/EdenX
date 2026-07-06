const fs = require('fs');
const path = require('path');

const PornhubScraper = require('./scrapers/normal/pornhub');
const XvideosScraper = require('./scrapers/normal/xvideos');
const XhamsterScraper = require('./scrapers/normal/xhamster');
const XnxxScraper = require('./scrapers/normal/xnxx');
const RedtubeScraper = require('./scrapers/normal/redtube');
const YoupornScraper = require('./scrapers/normal/youporn');

const PornhubHentaiScraper = require('./scrapers/hentai/pornhub-hentai');
const XvideosHentaiScraper = require('./scrapers/hentai/xvideos-hentai');
const HanimeScraper = require('./scrapers/hentai/hanime');
const Rule34VideoScraper = require('./scrapers/hentai/rule34video');

const PornhubJavScraper = require('./scrapers/jav/pornhub-jav');
const MissavScraper = require('./scrapers/jav/missav');
const ThisavScraper = require('./scrapers/jav/thisav');
const JavmostScraper = require('./scrapers/jav/javmost');

const SCRAPERS = {
    normal: [
        { name: 'Pornhub', scraper: PornhubScraper },
        { name: 'xVideos', scraper: XvideosScraper },
        { name: 'xHamster', scraper: XhamsterScraper },
        { name: 'XNXX', scraper: XnxxScraper },
        { name: 'RedTube', scraper: RedtubeScraper },
        { name: 'YouPorn', scraper: YoupornScraper },
    ],
    hentai: [
        { name: 'Pornhub Hentai', scraper: PornhubHentaiScraper },
        { name: 'xVideos Hentai', scraper: XvideosHentaiScraper },
        { name: 'Hanime', scraper: HanimeScraper },
        { name: 'Rule34Video', scraper: Rule34VideoScraper },
    ],
    jav: [
        { name: 'Pornhub JAV', scraper: PornhubJavScraper },
        { name: 'MissAV', scraper: MissavScraper },
        { name: 'ThisAV', scraper: ThisavScraper },
        { name: 'JavMost', scraper: JavmostScraper },
    ],
};

const OUTPUT_DIR = path.join(__dirname, '..', 'website', 'data');

function parseArgs() {
    const args = process.argv.slice(2);
    const options = {
        categories: ['normal', 'hentai', 'jav'],
        pages: 3,
        output: OUTPUT_DIR,
        help: false,
    };

    for (let i = 0; i < args.length; i++) {
        switch (args[i]) {
            case '--category':
            case '-c':
                options.categories = args[++i].split(',');
                break;
            case '--pages':
            case '-p':
                options.pages = parseInt(args[++i], 10);
                break;
            case '--output':
            case '-o':
                options.output = args[++i];
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }

    return options;
}

function showHelp() {
    console.log(`
EdenX Scraper - MILF Content Scraper

Usage: node src/index.js [options]

Options:
  -c, --category <cats>  Comma-separated categories: normal,hentai,jav (default: all)
  -p, --pages <n>        Number of pages to scrape per site (default: 3)
  -o, --output <dir>     Output directory (default: website/data/)
  -h, --help             Show this help message

Examples:
  node src/index.js                           # Scrape all categories
  node src/index.js -c normal                 # Scrape only normal porn
  node src/index.js -c hentai,jav -p 5       # Scrape hentai + JAV, 5 pages each
  node src/index.js -c normal -o ./output     # Scrape normal to custom dir
`);
}

async function runScraper(ScraperClass, pages) {
    const scraper = new ScraperClass();
    try {
        return await scraper.scrape(pages);
    } catch (err) {
        console.error(`  [${scraper.name}] Error: ${err.message}`);
        return [];
    }
}

function deduplicate(videos) {
    const seen = new Set();
    return videos.filter(v => {
        if (seen.has(v.id)) return false;
        seen.add(v.id);
        return true;
    });
}

async function main() {
    const options = parseArgs();

    if (options.help) {
        showHelp();
        process.exit(0);
    }

    console.log('=========================================');
    console.log('  EdenX Scraper');
    console.log('=========================================');
    console.log(`Categories: ${options.categories.join(', ')}`);
    console.log(`Pages per site: ${options.pages}`);
    console.log(`Output: ${options.output}`);
    console.log('=========================================');

    if (!fs.existsSync(options.output)) {
        fs.mkdirSync(options.output, { recursive: true });
    }

    const results = { normal: [], hentai: [], jav: [] };

    for (const category of options.categories) {
        if (!SCRAPERS[category]) {
            console.log(`\nUnknown category: ${category}`);
            continue;
        }

        console.log(`\n--- Scraping ${category.toUpperCase()} ---`);

        for (const { name, scraper: ScraperClass } of SCRAPERS[category]) {
            const videos = await runScraper(ScraperClass, options.pages);
            results[category].push(...videos);
        }

        results[category] = deduplicate(results[category]);
        console.log(`\n[${category}] Total unique videos: ${results[category].length}`);
    }

    // Save results
    for (const category of options.categories) {
        const filePath = path.join(options.output, `${category}.json`);
        const data = {
            category,
            lastUpdated: new Date().toISOString(),
            count: results[category].length,
            videos: results[category],
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        console.log(`\nSaved ${results[category].length} ${category} videos to ${filePath}`);
    }

    // Save combined index
    const indexPath = path.join(options.output, 'index.json');
    const index = {
        lastUpdated: new Date().toISOString(),
        categories: {},
    };
    for (const category of options.categories) {
        index.categories[category] = {
            count: results[category].length,
            file: `${category}.json`,
        };
    }
    fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    console.log(`\nSaved index to ${indexPath}`);

    console.log('\n=========================================');
    console.log('  Scraping complete!');
    console.log('=========================================');
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
