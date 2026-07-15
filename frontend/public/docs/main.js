// ===== Build sidebar navigation from sections =====
(function() {
    const sections = document.querySelectorAll('section[data-title]');
    const nav = document.getElementById('sidebarNav');
    let html = '';

    // Group structure
    const groups = [
        { title: '入门', ids: ['intro', 'quick-start', 'about'] },
        { title: 'API 接口', ids: ['chat-openai', 'chat-claude', 'chat-gemini', 'images', 'embeddings'] },
        { title: '系统 API', ids: ['system-api'] },
        { title: '代码示例', ids: ['python', 'nodejs'] },
        { title: '客户端配置', ids: ['clients'] },
        { title: '帮助', ids: ['help'] },
        { title: '联系客服', ids: ['contact'] },
    ];

    groups.forEach(g => {
        let items = '';
        g.ids.forEach(id => {
            const sec = document.getElementById(id);
            if (sec) {
                const title = sec.getAttribute('data-title');
                items += `<a class="nav-item" href="#${id}" data-target="${id}">${title}</a>`;
            }
        });
        html += `
            <div class="nav-group">
                <div class="nav-group-title">
                    <span class="nav-marker"></span>
                    <span class="nav-label">${g.title}</span>
                    <span class="chevron">▼</span>
                </div>
                <div class="nav-group-items">${items}</div>
            </div>`;
    });

    nav.innerHTML = html;

    // ===== Collapsible groups =====
    document.querySelectorAll('.nav-group-title').forEach(title => {
        title.addEventListener('click', () => {
            title.parentElement.classList.toggle('collapsed');
        });
    });

    // ===== Sub-headings as sub-nav (optional) =====
    // For sections with h2[id], add sub-nav items
    document.querySelectorAll('section[data-title]').forEach(sec => {
        const secId = sec.id;
        const h2s = sec.querySelectorAll('h2[id]');
        if (h2s.length === 0) return;
        // We keep it simple - no sub-nav for now, just scroll tracking
    });

    // ===== Active nav on scroll =====
    const navItems = document.querySelectorAll('.nav-item');
    function updateActive() {
        let current = '';
        sections.forEach(sec => {
            const top = sec.getBoundingClientRect().top;
            if (top < 120) current = sec.id;
        });
        navItems.forEach(item => {
            const isActive = item.dataset.target === current;
            item.classList.toggle('active', isActive);
            // auto-expand the group containing the active item
            if (isActive) {
                const group = item.closest('.nav-group');
                if (group && group.classList.contains('collapsed')) {
                    group.classList.remove('collapsed');
                }
            }
        });
    }
    window.addEventListener('scroll', updateActive, { passive: true });
    updateActive();

    // ===== Smooth scroll =====
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            const href = a.getAttribute('href');
            if (href === '#' || href.length < 2) return;
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // expand parent group if collapsed
                const group = a.closest('.nav-group');
                if (group) group.classList.remove('collapsed');
                // Close mobile sidebar
                document.getElementById('sidebar').classList.remove('open');
                document.getElementById('overlay').classList.remove('show');
            }
        });
    });

    // ===== Copy buttons on code blocks =====
    document.querySelectorAll('pre code').forEach(block => {
        const pre = block.parentElement;
        const btn = document.createElement('button');
        btn.className = 'copy-btn';
        btn.textContent = '复制';
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(block.textContent).then(() => {
                btn.textContent = '已复制';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = '复制';
                    btn.classList.remove('copied');
                }, 2000);
            });
        });
        pre.appendChild(btn);
    });

    // ===== Highlight.js =====
    if (window.hljs) {
        hljs.highlightAll();
    }

    // ===== Mobile menu =====
    document.getElementById('menuToggle').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('overlay').classList.toggle('show');
    });
    document.getElementById('overlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('overlay').classList.remove('show');
    });

    // ===== Back to top =====
    const toTop = document.getElementById('toTop');
    window.addEventListener('scroll', () => {
        toTop.classList.toggle('show', window.scrollY > 400);
    }, { passive: true });
    toTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
})();
