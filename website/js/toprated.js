// ============================================
// EdenX - Top Rated Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    initHeader();
    initSearch();
    await loadAllData();
    loadTopRatedVideos();
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
    
    searchBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            window.location.href = `search.html?q=${encodeURIComponent(searchInput.value)}`;
        }
    });
}

function loadTopRatedVideos() {
    const grid = document.getElementById('topRatedGrid');
    if (!grid) return;
    
    const topRated = getTopRatedVideos();
    grid.innerHTML = topRated.map((video, index) => createVideoCard(video, index < 2)).join('');
}

function createVideoCard(video, featured = false) {
    return `
        <div class="video-card ${featured ? 'featured' : ''}" onclick="playVideo('${video.id}')">
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
                    <span>${video.rating} rating</span>
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
