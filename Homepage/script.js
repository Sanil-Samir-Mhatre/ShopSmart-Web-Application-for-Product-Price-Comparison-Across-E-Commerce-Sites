document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------
    // 0. Global Authentication UI Injection
    // ----------------------------------------------------------------
    const token = localStorage.getItem('shopsmart_token');
    const username = localStorage.getItem('shopsmart_username');
    
    if (token && username) {
        // 1. Update the top right user pill globally
        const globalPill = document.querySelector('.user-pill');
        if (globalPill && !globalPill.innerText.includes('Log Out')) {
            globalPill.style.cursor = 'pointer';
            globalPill.innerHTML = `<i class="fa-solid fa-circle-user"></i> <span>${username}</span>`;
            // Do not override if index.html already sets an onclick
            if (!globalPill.hasAttribute('onclick')) {
                globalPill.onclick = () => window.location.href = 'profile.html';
            }
        }

        // 2. Add "Search" to the navigation links globally if logged in
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && !navLinks.innerHTML.includes('search.html')) {
            const searchLink = document.createElement('a');
            searchLink.href = 'search.html';
            searchLink.innerText = 'Search';
            // Insert it elegantly right after the "Home" link
            navLinks.insertBefore(searchLink, navLinks.children[1]);
        }
    }

    // ----------------------------------------------------------------
    // 1. Emoji Scattered Tumble Animation
    // ----------------------------------------------------------------
    const emojiContainer = document.getElementById('emojiContainer');
    const emojis = ['🛍️', '🛒', '🛍️', '🔖', '💳', '🎁', '🎈', '🛒', '📦'];
    
    function createEmoji() {
        const emojiEl = document.createElement('div');
        emojiEl.className = 'emoji';
        emojiEl.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        
        // Randomize starting position, size, and duration
        const left = Math.random() * 90; // 0 to 90%
        const size = Math.random() * 1.5 + 1; // 1rem to 2.5rem
        const duration = Math.random() * 4 + 3; // 3s to 7s
        const delay = Math.random() * 5; // 0 to 5s delay

        emojiEl.style.left = `${left}%`;
        emojiEl.style.fontSize = `${size}rem`;
        emojiEl.style.animationDuration = `${duration}s`;
        emojiEl.style.animationDelay = `${delay}s`;

        emojiContainer.appendChild(emojiEl);

        // Remove emoji after animation finishes and create a new one to keep it continuous
        setTimeout(() => {
            emojiEl.remove();
            createEmoji();
        }, (duration + delay) * 1000);
    }

    // Initialize initial set of emojis
    for (let i = 0; i < 12; i++) {
        createEmoji();
    }

});
