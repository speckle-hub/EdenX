// ============================================
// EdenX - Main Application Logic
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    initAgeGate();
    initHeader();
    initSearch();
    initCategoryPills();
    await loadAllData();
    loadVideoGrids();
});

// ============================================
// Age Gate
// ============================================
function initAgeGate() {
    const ageGate = document.getElementById('ageGate');
    if (!ageGate) return;
    if (sessionStorage.getItem('ageVerified')) {
        ageGate.classList.remove('active');
    }
}

function enterSite() {
    const ageGate = document.getElementById('ageGate');
    sessionStorage.setItem('ageVerified', 'true');
    ageGate.classList.remove('active');
}

// ============================================
// Header Scroll Effect
// ============================================
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ============================================
// Search Functionality
// ============================================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const suggestions = document.getElementById('searchSuggestions');
    if (!searchInput) return;

    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
        };
    }

    const showSuggestions = debounce((query) => {
        if (query.length < 2) { suggestions.classList.remove('active'); return; }
        const results = searchVideos(query).slice(0, 5);
        if (!results.length) { suggestions.classList.remove('active'); return; }
        suggestions.innerHTML = results.map(video => `
            <div class="search-suggestion-item" onclick="playVideo('${video.id}')">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <span>${highlightMatch(video.title, query)}</span>
            </div>
        `).join('');
        suggestions.classList.add('active');
    }, 300);

    searchInput.addEventListener('input', (e) => showSuggestions(e.target.value));
    searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') performSearch(searchInput.value); });
    searchBtn.addEventListener('click', () => performSearch(searchInput.value));
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-container')) suggestions.classList.remove('active');
    });
}

function highlightMatch(text, query) {
    return text.replace(new RegExp(`(${query})`, 'gi'), '<strong style="color:var(--primary-light)">$1</strong>');
}

function performSearch(query) {
    if (!query.trim()) return;
    window.location.href = `search.html?q=${encodeURIComponent(query)}`;
}

// ============================================
// Category Pills
// ============================================
function initCategoryPills() {
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', () => {
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            filterVideosByCategory(pill.dataset.category);
        });
    });
}

function filterVideosByCategory(category) {
    document.querySelectorAll('.video-grid').forEach(grid => {
        grid.querySelectorAll('.video-card').forEach(card => {
            const cats = card.dataset.categories?.split(',') || [];
            card.style.display = (category === 'all' || cats.includes(category)) ? '' : 'none';
        });
    });
}

// ============================================
// Video Grid Rendering
// ============================================
function loadVideoGrids() {
    const grids = {
        trendingGrid: getTrendingVideos(),
        latestGrid: getLatestVideos(),
        topRatedGrid: getTopRatedVideos(),
    };
    for (const [id, videos] of Object.entries(grids)) {
        const grid = document.getElementById(id);
        if (!grid) continue;
        if (videos.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text-muted);">
                <p>No videos yet. Run the scraper to add content.</p></div>`;
        } else {
            grid.innerHTML = videos.map((v, i) => createVideoCard(v, i === 0)).join('');
        }
    }
}

function createVideoCard(video, featured = false) {
    const duration = typeof video.duration === 'number'
        ? formatDuration(video.duration)
        : video.duration || '0:00';
    const views = typeof video.views === 'number'
        ? formatViews(video.views) + ' views'
        : video.views || '';

    return `
        <div class="video-card ${featured ? 'featured' : ''}"
             data-categories="${(video.tags || []).map(t => t.toLowerCase()).join(',')}"
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
                    ${views ? `<span>${views}</span>` : ''}
                    <span class="category-badge badge-${video.category}">${video.category}</span>
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
