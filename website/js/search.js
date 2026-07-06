// ============================================
// EdenX - Search Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    initHeader();
    await loadAllData();
    performSearch();
});

// ============================================
// Header Scroll Effect
// ============================================
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// ============================================
// Search
// ============================================
function performSearch() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    
    if (!query) {
        window.location.href = 'index.html';
        return;
    }
    
    // Update search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = query;
    }
    
    // Update page title
    document.title = `Search: ${query} | EdenX`;
    
    // Update search count
    const countEl = document.getElementById('searchCount');
    
    // Perform search
    const results = searchVideos(query);
    
    // Render results
    const grid = document.getElementById('searchResults');
    const noResults = document.getElementById('noResults');
    
    if (results.length === 0) {
        grid.classList.add('hidden');
        noResults.classList.remove('hidden');
        if (countEl) countEl.textContent = '';
    } else {
        grid.classList.remove('hidden');
        noResults.classList.add('hidden');
        if (countEl) countEl.textContent = `(${results.length} videos)`;
        
        grid.innerHTML = results.map((video, index) => createVideoCard(video)).join('');
    }
    
    // Init search input for new searches
    initSearchInput();
}

function initSearchInput() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && searchInput.value.trim()) {
            window.location.href = `search.html?q=${encodeURIComponent(searchInput.value)}`;
        }
    });
    
    searchBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            window.location.href = `search.html?q=${encodeURIComponent(searchInput.value)}`;
        }
    });
}

function createVideoCard(video) {
    return `
        <div class="video-card" onclick="playVideo('${video.id}')">
            <div class="video-thumbnail">
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                <div class="video-duration">${video.duration}</div>
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
                    <span>${video.views} views</span>
                    <span class="dot"></span>
                    <span>${video.date}</span>
                </div>
                <div class="video-tags">
                    ${video.tags.slice(0, 3).map(tag => `<span class="video-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

function playVideo(videoId) {
    window.location.href = `player.html?id=${videoId}`;
}
