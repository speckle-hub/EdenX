// ============================================
// EdenX - Scraped Data Loader
// ============================================

const ScrapedDataLoader = {
    cache: {},

    async load(category) {
        if (this.cache[category]) return this.cache[category];

        try {
            const response = await fetch(`data/${category}.json`);
            if (!response.ok) return [];
            const data = await response.json();
            this.cache[category] = data.videos || [];
            return this.cache[category];
        } catch (err) {
            console.warn(`Failed to load scraped ${category} data:`, err.message);
            return [];
        }
    },

    async loadAll() {
        const [normal, hentai, jav] = await Promise.all([
            this.load('normal'),
            this.load('hentai'),
            this.load('jav'),
        ]);
        return { normal, hentai, jav, all: [...normal, ...hentai, ...jav] };
    },

    async getVideosByCategory(category) {
        const data = await this.loadAll();
        if (category === 'all') return data.all;
        return data[category] || [];
    },

    async searchVideos(query) {
        const data = await this.loadAll();
        const q = query.toLowerCase();
        return data.all.filter(v =>
            v.title.toLowerCase().includes(q) ||
            v.tags.some(t => t.toLowerCase().includes(q)) ||
            v.pornstars.some(p => p.toLowerCase().includes(q))
        );
    },

    formatDuration(seconds) {
        if (!seconds) return '0:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        return `${m}:${String(s).padStart(2, '0')}`;
    },

    formatViews(count) {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(0) + 'K';
        return String(count);
    },

    toVideoCard(video) {
        const duration = typeof video.duration === 'number'
            ? this.formatDuration(video.duration)
            : video.duration || '0:00';
        const views = typeof video.views === 'number'
            ? this.formatViews(video.views) + ' views'
            : video.views || '';

        return `
            <div class="video-card"
                 data-categories="${(video.tags || []).map(t => t.toLowerCase()).join(',')}"
                 data-category="${video.category || 'normal'}"
                 onclick="playVideo('${video.id}')">
                <div class="video-thumbnail">
                    <img src="${video.thumbnail}" alt="${video.title}" loading="lazy"
                         onerror="this.src='https://placehold.co/640x360/1a1a25/ff2d55?text=No+Thumb'">
                    <div class="video-duration">${duration}</div>
                    <div class="play-overlay">
                        <div class="play-btn">
                            <svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                        </div>
                    </div>
                </div>
                <div class="video-info">
                    <h3 class="video-title">${video.title}</h3>
                    <div class="video-meta">
                        <span class="source">${video.source}</span>
                        <span class="dot"></span>
                        ${views ? `<span>${views}</span><span class="dot"></span>` : ''}
                        <span class="category-badge badge-${video.category}">${video.category}</span>
                    </div>
                    <div class="video-tags">
                        ${(video.tags || []).slice(0, 3).map(tag => `<span class="video-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;
    }
};
