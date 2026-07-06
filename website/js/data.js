// ============================================
// EdenX - Data Store (Live from Scraped JSON)
// ============================================

let _allVideos = [];
let _dataLoaded = false;

async function loadAllData() {
    if (_dataLoaded) return _allVideos;
    const categories = ['normal', 'hentai', 'jav'];

    const loadCat = async (cat) => {
        try {
            const r = await fetch(`data/${cat}.json`);
            if (!r.ok) return [];
            const d = await r.json();
            return d.videos || [];
        } catch (e) {
            console.warn(`Failed to load ${cat}:`, e);
            return [];
        }
    };

        const results = await Promise.all(categories.map(loadCat));
    try {
        const psRes = await fetch('data/pornstars.json');
        if (psRes.ok) {
            const psData = await psRes.json();
            PORNSTARS = psData.pornstars || [];
        }
    } catch(e) { console.error(e); }
    _allVideos = results.flat();
    _dataLoaded = true;
    console.log(`Loaded ${_allVideos.length} videos`);
    return _allVideos;
}

function getVideoById(id) {
    return _allVideos.find(v => v.id === id);
}

function getVideosByCategory(category) {
    return _allVideos.filter(v => v.category === category);
}

function getVideosByTag(tag) {
    const q = tag.toLowerCase();
    return _allVideos.filter(v => v.tags.some(t => t.toLowerCase() === q));
}

function getVideosBySource(source) {
    const q = source.toLowerCase();
    return _allVideos.filter(v => v.source.toLowerCase() === q);
}

function getTrendingVideos() {
    return [..._allVideos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 24);
}

function getLatestVideos() {
    return _allVideos.slice(0, 24);
}

function getTopRatedVideos() {
    return [..._allVideos].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 24);
}

function searchVideos(query) {
    const q = query.toLowerCase();
    return _allVideos.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.tags.some(t => t.toLowerCase().includes(q)) ||
        v.pornstars.some(p => p.toLowerCase().includes(q)) ||
        v.source.toLowerCase().includes(q)
    );
}

function getRandomVideos(count = 6) {
    const shuffled = [..._allVideos].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function getAllTags() {
    const tagCounts = {};
    _allVideos.forEach(v => {
        (v.tags || []).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30)
        .map(([tag, count]) => ({ tag, count }));
}

function getVideoStats() {
    const normal = _allVideos.filter(v => v.category === 'normal').length;
    const hentai = _allVideos.filter(v => v.category === 'hentai').length;
    const jav = _allVideos.filter(v => v.category === 'jav').length;
    return { total: _allVideos.length, normal, hentai, jav };
}

// ============================================
// Pornstar Data (Static / Curated)
// ============================================
let PORNSTARS = [];



function getPornstarById(id) {
    return PORNSTARS.find(p => p.id === id);
}

function getPornstarsByTag(tag) {
    return PORNSTARS.filter(p => p.tags.some(t => t.toLowerCase() === tag.toLowerCase()));
}

function getTopPornstars(count = 12) {
    return [...PORNSTARS].sort((a, b) => b.rating - a.rating).slice(0, count);
}

function getNewestPornstars(count = 12) {
    return [...PORNSTARS].sort((a, b) => b.videoCount - a.videoCount).slice(0, count);
}

function searchPornstars(query) {
    const q = query.toLowerCase();
    return PORNSTARS.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q)) ||
        p.nationalities.some(n => n.toLowerCase().includes(q))
    );
}

function getVideosByPornstar(pornstarId) {
    return getRandomVideos(12);
}

function getPopularPornstarTags() {
    const tagCounts = {};
    PORNSTARS.forEach(p => {
        p.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });
    return Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([tag, count]) => ({ tag, count }));
}
