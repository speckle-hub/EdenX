// ============================================
// EdenX - Pornstars Listing Page Logic
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initHeader();
    initSearch();
    initAlphaNav();
    initFilters();
    loadPornstars();
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
            filterPornstarsByName(searchInput.value);
        }
    });
    
    searchBtn.addEventListener('click', () => {
        if (searchInput.value.trim()) {
            filterPornstarsByName(searchInput.value);
        }
    });
}

function filterPornstarsByName(query) {
    const results = searchPornstars(query);
    renderPornstars(results);
}

// ============================================
// Alphabet Navigation
// ============================================
function initAlphaNav() {
    const nav = document.getElementById('alphaNav');
    if (!nav) return;
    
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    
    nav.innerHTML = `
        <button class="alpha-btn active" data-letter="all">#</button>
        ${letters.map(l => `<button class="alpha-btn" data-letter="${l}">${l}</button>`).join('')}
    `;
    
    nav.querySelectorAll('.alpha-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            nav.querySelectorAll('.alpha-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const letter = btn.dataset.letter;
            if (letter === 'all') {
                renderPornstars(PORNSTARS);
            } else {
                const filtered = PORNSTARS.filter(p => p.name.charAt(0).toUpperCase() === letter);
                renderPornstars(filtered);
            }
        });
    });
}

// ============================================
// Filters
// ============================================
function initFilters() {
    const pills = document.querySelectorAll('.filter-pill');
    const sortSelect = document.getElementById('sortSelect');
    
    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            
            const tag = pill.dataset.tag;
            if (tag === 'all') {
                renderPornstars(PORNSTARS);
            } else {
                const filtered = getPornstarsByTag(tag);
                renderPornstars(filtered);
            }
        });
    });
    
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            const sort = sortSelect.value;
            let sorted;
            
            switch (sort) {
                case 'rating':
                    sorted = [...PORNSTARS].sort((a, b) => b.rating - a.rating);
                    break;
                case 'videos':
                    sorted = [...PORNSTARS].sort((a, b) => b.videoCount - a.videoCount);
                    break;
                case 'az':
                    sorted = [...PORNSTARS].sort((a, b) => a.name.localeCompare(b.name));
                    break;
                default:
                    sorted = PORNSTARS;
            }
            
            renderPornstars(sorted);
        });
    }
}

// ============================================
// Load Pornstars
// ============================================
function loadPornstars() {
    renderPornstars(PORNSTARS);
}

function renderPornstars(pornstars) {
    const grid = document.getElementById('pornstarGrid');
    if (!grid) return;
    
    if (pornstars.length === 0) {
        grid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 2rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">&#128269;</div>
                <h3>No pornstars found</h3>
                <p style="color: var(--text-muted);">Try a different search or filter.</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = pornstars.map(ps => createPornstarCard(ps)).join('');
}

function createPornstarCard(pornstar) {
    return `
        <div class="pornstar-card" onclick="window.location.href='pornstar.html?id=${pornstar.id}'">
            <div class="pornstar-thumb">
                <img src="${pornstar.thumbnail}" alt="${pornstar.name}" loading="lazy">
                <div class="pornstar-overlay">
                    <div class="pornstar-rating">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        ${pornstar.rating}%
                    </div>
                </div>
            </div>
            <div class="pornstar-info">
                <h3 class="pornstar-name">${pornstar.name}</h3>
                <div class="pornstar-meta">
                    <span class="videos">${pornstar.videoCount} videos</span>
                    <span>&middot;</span>
                    <span>${pornstar.age} yrs</span>
                </div>
                <div class="pornstar-tags">
                    ${pornstar.tags.slice(0, 2).map(tag => `<span class="pornstar-tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}
