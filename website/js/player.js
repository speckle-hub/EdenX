// ============================================
// EdenX - Player Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    initHeader();
    await loadAllData();
    loadVideoPlayer();
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
// Load Video Player
// ============================================
function loadVideoPlayer() {
    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('id');
    
    if (!videoId) {
        window.location.href = 'index.html';
        return;
    }
    
    const video = getVideoById(videoId);
    
    if (!video) {
        document.getElementById('videoTitle').textContent = 'Video not found';
        return;
    }
    
    // Update page title
    document.title = `${video.title} | EdenX`;
    
    // Load embed
    loadEmbed(video);
    
    // Update video info
    document.getElementById('videoTitle').textContent = video.title;
    document.getElementById('videoViews').textContent = (video.views || 0) + ' views';
    document.getElementById('videoDate').textContent = video.date || 'Unknown';
    document.getElementById('videoRating').textContent = (video.rating || 0) + ' rating';
    
    const sourceUrl = getSourceUrl(video);
    const sourceEl = document.getElementById('videoSource');
    sourceEl.querySelector('span:last-child').textContent = video.source || 'Unknown';
    sourceEl.onclick = () => window.open(sourceUrl, '_blank');
    
    // Load tags
    const tagsContainer = document.getElementById('videoTags');
    tagsContainer.innerHTML = (video.tags || []).map(tag => 
        `<a href="search.html?q=${encodeURIComponent(tag)}" class="player-tag">${tag}</a>`
    ).join('');
    
    // Download/Source button
    document.getElementById('downloadBtn').href = sourceUrl;
    
    // Load related videos
    loadRelatedVideos(video);
    
    // Init actions
    initPlayerActions();
}

function loadEmbed(video) {
    const wrapper = document.getElementById('playerWrapper');
    const sourceUrl = getSourceUrl(video);
    
    wrapper.innerHTML = `
        <div style="position:relative;width:100%;height:100%;cursor:pointer;overflow:hidden;"
             onclick="window.open('${sourceUrl}', '_blank')">
            <img src="${video.thumbnail}" alt="${video.title}" 
                 style="width:100%;height:100%;object-fit:cover;"
                 onerror="this.style.display='none'">
            <div style="position:absolute;top:0;left:0;width:100%;height:100%;
                        background:rgba(0,0,0,0.5);
                        display:flex;align-items:center;justify-content:center;
                        flex-direction:column;gap:1rem;">
                <div style="width:80px;height:80px;border-radius:50%;
                            background:rgba(255,45,85,0.95);
                            display:flex;align-items:center;justify-content:center;
                            font-size:2rem;color:white;transition:transform 0.2s;
                            box-shadow:0 4px 20px rgba(255,45,85,0.4);">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
                <div style="background:var(--gradient-primary);padding:0.8rem 2rem;
                            border-radius:50px;font-weight:600;font-size:1.1rem;
                            box-shadow:0 4px 15px rgba(0,0,0,0.3);">
                    Watch on ${video.source}
                </div>
            </div>
        </div>
    `;
}

function getSourceUrl(video) {
    const embed = video.embedUrl || '';
    // Convert embed URLs to source page URLs (xvideos, xnxx)
    if (embed.includes('/embedframe/')) {
        return embed.replace('/embedframe/', '/video/');
    }
    return embed;
}

// ============================================
// Related Videos
// ============================================
function loadRelatedVideos(currentVideo) {
    const container = document.getElementById('relatedVideos');
    if (!container) return;
    
    let related = getVideosByCategory(currentVideo.category).filter(v => v.id !== currentVideo.id);
    if (related.length < 6) {
        const random = getRandomVideos(6 - related.length).filter(v =>
            v.id !== currentVideo.id && !related.some(r => r.id === v.id)
        );
        related = [...related, ...random];
    }
    
    container.innerHTML = related.slice(0, 8).map(video => `
        <div class="related-video-card" onclick="playVideo('${video.id}')">
            <div class="related-video-thumb">
                <img src="${video.thumbnail}" alt="${video.title}" loading="lazy">
                <span class="duration">${video.duration}</span>
            </div>
            <div class="related-video-info">
                <h4>${video.title}</h4>
                <div class="meta">${video.source} &middot; ${video.views} views</div>
            </div>
        </div>
    `).join('');
}

function playVideo(videoId) {
    window.location.href = `player.html?id=${videoId}`;
}

// ============================================
// Player Actions
// ============================================
function initPlayerActions() {
    const likeBtn = document.getElementById('likeBtn');
    const favBtn = document.getElementById('favoriteBtn');
    const shareBtn = document.getElementById('shareBtn');
    
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            likeBtn.classList.toggle('liked');
            if (likeBtn.classList.contains('liked')) {
                likeBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    Liked!
                `;
                showToast('Added to liked videos');
            } else {
                likeBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                    Like
                `;
            }
        });
    }
    
    if (favBtn) {
        favBtn.addEventListener('click', () => {
            favBtn.classList.toggle('favorited');
            if (favBtn.classList.contains('favorited')) {
                favBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    Favorited!
                `;
                showToast('Added to favorites');
            } else {
                favBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    Favorite
                `;
            }
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } else {
                // Copy to clipboard
                navigator.clipboard.writeText(window.location.href);
                showToast('Link copied to clipboard!');
            }
        });
    }
}

// ============================================
// Toast Notifications
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
