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
    document.getElementById('videoViews').textContent = video.views + ' views';
    document.getElementById('videoDate').textContent = video.date;
    document.getElementById('videoRating').textContent = video.rating + ' rating';
    
    const sourceEl = document.getElementById('videoSource');
    sourceEl.querySelector('span:last-child').textContent = video.source;
    sourceEl.onclick = () => window.open(video.sourceUrl, '_blank');
    
    // Load tags
    const tagsContainer = document.getElementById('videoTags');
    tagsContainer.innerHTML = video.tags.map(tag => 
        `<a href="search.html?q=${encodeURIComponent(tag)}" class="player-tag">${tag}</a>`
    ).join('');
    
    // Download/Source button
    document.getElementById('downloadBtn').href = video.sourceUrl;
    
    // Load related videos
    loadRelatedVideos(video);
    
    // Init actions
    initPlayerActions();
}

function loadEmbed(video) {
    const wrapper = document.getElementById('playerWrapper');
    
    // For demo purposes, we show a placeholder
    // In production, the embed URL would be a real embeddable player URL
    
    // Example of how real embeds work:
    // Some sites provide iframe embeds like:
    // https://www.sitename.com/embed/VIDEO_ID
    
    // For this demo, we create a styled placeholder
    wrapper.innerHTML = `
        <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #111 0%, #1a1a25 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 1rem;
        ">
            <div style="font-size: 4rem;">&#127909;</div>
            <div style="
                background: var(--gradient-primary);
                padding: 1rem 2rem;
                border-radius: 50px;
                cursor: pointer;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                transition: transform 0.3s;
            " onclick="window.open('${video.sourceUrl}', '_blank')">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Watch on ${video.source}
            </div>
            <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; max-width: 400px;">
                Click to watch the full video on the official ${video.source} website
            </p>
        </div>
    `;
    
    // If you have real embed URLs, use this instead:
    // wrapper.innerHTML = `<iframe src="${video.embedUrl}" allowfullscreen></iframe>`;
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
