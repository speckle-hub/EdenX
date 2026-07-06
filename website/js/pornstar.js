// ============================================
// EdenX - Pornstar Profile Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initSearch();
    loadPornstarProfile();
});

// ============================================
// Header
// ============================================
function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;
    
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// ============================================
// Search
// ============================================
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

// ============================================
// Load Pornstar Profile
// ============================================
function loadPornstarProfile() {
    const params = new URLSearchParams(window.location.search);
    const pornstarId = params.get('id');
    
    if (!pornstarId) {
        window.location.href = 'pornstars.html';
        return;
    }
    
    const pornstar = getPornstarById(pornstarId);
    
    if (!pornstar) {
        document.getElementById('profileHeader').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">&#128533;</div>
                <h2>Pornstar not found</h2>
                <a href="pornstars.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Pornstars</a>
            </div>
        `;
        return;
    }
    
    // Update page title
    document.title = `${pornstar.name} | EdenX`;
    
    // Render profile header
    renderProfileHeader(pornstar);
    
    // Load videos
    loadPornstarVideos(pornstar);
    
    // Load related pornstars
    loadRelatedPornstars(pornstar);
    
    // Init tabs
    initVideoTabs(pornstar);
}

function renderProfileHeader(pornstar) {
    const container = document.getElementById('profileHeader');
    
    container.innerHTML = `
        <div class="profile-photo">
            <img src="${pornstar.thumbnail}" alt="${pornstar.name}">
            <div class="profile-badge">&#11088; Featured</div>
        </div>
        <div class="profile-details">
            <h1 class="profile-name">${pornstar.name}</h1>
            
            <div class="profile-meta">
                <div class="profile-meta-item">
                    <span class="icon">&#128196;</span>
                    <span class="value">${pornstar.videoCount}</span> videos
                </div>
                <div class="profile-meta-item">
                    <span class="icon">&#11088;</span>
                    <span class="value">${pornstar.rating}%</span> rating
                </div>
                <div class="profile-meta-item">
                    <span class="icon">&#128100;</span>
                    <span class="value">${pornstar.age}</span> years old
                </div>
                <div class="profile-meta-item">
                    <span class="icon">&#127758;</span>
                    ${pornstar.nationalities.join(', ')}
                </div>
            </div>
            
            <p class="profile-bio">${pornstar.bio}</p>
            
            <div class="profile-tags">
                ${pornstar.tags.map(tag => `<a href="search.html?q=${encodeURIComponent(tag)}" class="profile-tag">${tag}</a>`).join('')}
            </div>
            
            <div class="profile-actions">
                <button class="btn btn-primary" onclick="followPornstar('${pornstar.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    Follow
                </button>
                <button class="btn btn-secondary" onclick="sharePornstar('${pornstar.id}')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    Share
                </button>
            </div>
            
            <div class="profile-stats">
                <div class="profile-stat">
                    <div class="profile-stat-value">${pornstar.videoCount}</div>
                    <div class="profile-stat-label">Videos</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-value">${(pornstar.videoCount * 12500).toLocaleString()}</div>
                    <div class="profile-stat-label">Total Views</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-value">${pornstar.rating}%</div>
                    <div class="profile-stat-label">Rating</div>
                </div>
                <div class="profile-stat">
                    <div class="profile-stat-value">#${Math.floor(Math.random() * 50) + 1}</div>
                    <div class="profile-stat-label">Ranking</div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// Pornstar Videos
// ============================================
function loadPornstarVideos(pornstar, sort = 'latest') {
    const grid = document.getElementById('pornstarVideos');
    if (!grid) return;
    
    let videos = getVideosByPornstar(pornstar.id);
    
    // Sort videos
    switch (sort) {
        case 'popular':
            videos = [...videos].sort((a, b) => b.viewsNum - a.viewsNum);
            break;
        case 'top-rated':
            videos = [...videos].sort((a, b) => parseInt(b.rating) - parseInt(a.rating));
            break;
        default:
            // latest - keep original order
            break;
    }
    
    grid.innerHTML = videos.map((video, index) => createVideoCard(video, index < 2)).join('');
}

function initVideoTabs(pornstar) {
    const tabs = document.querySelectorAll('.video-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const sort = tab.dataset.tab;
            loadPornstarVideos(pornstar, sort);
        });
    });
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

// ============================================
// Related Pornstars
// ============================================
function loadRelatedPornstars(pornstar) {
    const container = document.getElementById('relatedPornstars');
    if (!container) return;
    
    // Get related pornstars by shared tags
    let related = PORNSTARS.filter(p => 
        p.id !== pornstar.id && 
        p.tags.some(t => pornstar.tags.includes(t))
    );
    
    // Sort by rating and take top 6
    related = related.sort((a, b) => b.rating - a.rating).slice(0, 6);
    
    container.innerHTML = related.map(ps => `
        <div class="related-card" onclick="window.location.href='pornstar.html?id=${ps.id}'">
            <img src="${ps.thumbnail}" alt="${ps.name}" loading="lazy">
            <div class="related-card-name">${ps.name}</div>
        </div>
    `).join('');
}

// ============================================
// Actions
// ============================================
function followPornstar(id) {
    const pornstar = getPornstarById(id);
    showToast(`Following ${pornstar.name}!`);
}

function sharePornstar(id) {
    if (navigator.share) {
        navigator.share({
            title: document.title,
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!');
    }
}

// ============================================
// Toast
// ============================================
function showToast(message) {
    const container = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <span class="toast-icon">&#9989;</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}
