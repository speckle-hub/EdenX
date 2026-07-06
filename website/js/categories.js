// ============================================
// EdenX - Categories Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    initHeader();
    initSearch();
    await loadAllData();
    handleCategoryView();
});

function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    if (!searchInput) return;
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            window.location.href = `search.html?q=${encodeURIComponent(searchInput.value)}`;
        }
    });
    searchBtn?.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            window.location.href = `search.html?q=${encodeURIComponent(searchInput.value)}`;
        }
    });
}

function handleCategoryView() {
    const params = new URLSearchParams(window.location.search);
    const category = params.get('cat');
    if (category) {
        showCategoryVideos(category);
    } else {
        showCategoriesGrid();
    }
}

function showCategoriesGrid() {
    document.getElementById('categoryView')?.classList.remove('hidden');
    document.getElementById('categoryVideosView')?.classList.add('hidden');

    const grid = document.getElementById('categoriesGrid');
    if (!grid) return;

    const cats = getAllTags();
    grid.innerHTML = cats.map(({ tag, count }) => `
        <div class="category-card" onclick="window.location.href='categories.html?cat=${encodeURIComponent(tag)}'">
            <img src="https://placehold.co/600x340/1a1a25/ff2d55?text=${encodeURIComponent(tag)}" alt="${tag}" loading="lazy">
            <div class="category-card-overlay">
                <div class="category-card-name">${tag}</div>
                <div class="category-card-count">${count} videos</div>
            </div>
        </div>
    `).join('');
}

function showCategoryVideos(categoryId) {
    document.getElementById('categoryView')?.classList.add('hidden');
    document.getElementById('categoryVideosView')?.classList.remove('hidden');

    const videos = getVideosByTag(categoryId);
    const titleEl = document.getElementById('categoryTitle');
    if (titleEl) {
        titleEl.innerHTML = `${categoryId} <span class="count" style="font-size:1rem;font-weight:400;color:var(--text-muted);">(${videos.length} videos)</span>`;
        document.title = `${categoryId} Videos | EdenX`;
    }

    const grid = document.getElementById('categoryVideosGrid');
    if (!grid) return;

    if (!videos.length) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">&#128269;</div>
                <h3 style="margin-bottom: 0.5rem;">No videos found</h3>
                <p style="color: var(--text-muted);">Run the scraper to populate this category.</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = videos.map((video, index) => createVideoCard(video, index < 2)).join('');
    renderPagination(videos.length);
    initSortButtons();
}

function createVideoCard(video, featured = false) {
    const duration = typeof video.duration === 'number'
        ? formatDuration(video.duration)
        : video.duration || '0:00';
    const views = typeof video.views === 'number'
        ? formatViews(video.views) + ' views'
        : video.views || '';

    return `
        <div class="video-card ${featured ? 'featured' : ''}" onclick="playVideo('${video.id}')">
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy"
                     onerror="this.src='https://placehold.co/640x360/1a1a25/ff2d55?text=No+Thumb'">
                <div class="video-duration">${duration}</div>
                <div class="play-overlay">
                    <div class="play-btn"><svg viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                </div>
            </div>
            <div class="video-info">
                <h3 class="video-title">${video.title}</h3>
                <div class="video-meta">
                    <span class="source">${video.source}</span>
                    <span class="dot"></span>
                    ${views ? `<span>${views}</span>` : ''}
                </div>
                <div class="video-tags">
                    ${(video.tags || []).slice(0, 3).map(tag => `<span class="video-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function formatDuration(seconds) {
    if (!seconds) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
}

function formatViews(count) {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(0) + 'K';
    return String(count);
}

function playVideo(videoId) {
    window.location.href = `player.html?id=${videoId}`;
}

function initSortButtons() {
    document.querySelectorAll('.category-sort').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.category-sort').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function renderPagination(totalItems) {
    const container = document.getElementById('categoryPagination');
    if (!container) return;
    const totalPages = Math.ceil(totalItems / 12);
    if (totalPages <= 1) { container.innerHTML = ''; return; }
    let html = `<button class="pagination-btn" disabled>&#8249; Prev</button>`;
    for (let i = 1; i <= Math.min(totalPages, 5); i++) {
        html += `<button class="pagination-btn ${i === 1 ? 'active' : ''}">${i}</button>`;
    }
    if (totalPages > 5) html += `<button class="pagination-btn">...</button><button class="pagination-btn">${totalPages}</button>`;
    html += `<button class="pagination-btn">Next &#8250;</button>`;
    container.innerHTML = html;
    container.querySelectorAll('.pagination-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.disabled || btn.textContent === '...') return;
            container.querySelectorAll('.pagination-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}
