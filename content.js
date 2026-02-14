(function () {
    'use strict';

    let seen = new WeakSet();

    const sidebar = document.createElement('div');
    style_sidebar();
    const prompt_list = document.createElement('div');
    sidebar.appendChild(prompt_list);
    document.body.appendChild(sidebar);

    let current_path = location.pathname;

    const dom_observer = new MutationObserver((mutations) => {
        handle_mutations(mutations);
    }); 

    dom_observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    if ('navigation' in window) {
        window.navigation.addEventListener("navigate", (event) => {
            handle_location_change();
        });
    }

    function style_sidebar() {
        // Styles the "prompts" sidebar

        sidebar.id = 'tm-jump-sidebar';

        sidebar.style.position = 'fixed';
        sidebar.style.top = '0';
        sidebar.style.right = '0';
        sidebar.style.width = '260px';
        sidebar.style.height = '100vh';
        sidebar.style.background = '#111';
        sidebar.style.color = '#eee';
        sidebar.style.zIndex = '9999';
        sidebar.style.padding = '8px';
        sidebar.style.overflowY = 'auto';
        sidebar.style.fontSize = '12px';

        sidebar.innerHTML = `
            <div style="font-weight:bold; margin-bottom:8px;">
                Prompts
            </div>`;
    }

    function addStoreButton(article) {
        // Adds a "store" button to the answer
        // TODO: fill in the onclick functionality
        if (article.querySelector('.tm-store-btn')) return;

        const btn = document.createElement('button');
        btn.textContent = 'Store';
        btn.className = 'tm-store-btn';

        btn.style.margin = '4px';
        btn.style.padding = '2px 6px';
        btn.style.fontSize = '12px';
        btn.style.cursor = 'pointer';

        btn.onclick = () => {
            console.log('Store clicked for article', article.dataset.turnId || article.dataset.testid);
        };

        article.appendChild(btn);
    }


    function itemize(article) {
        // Adds a quicklink to the "prompts" sidebar
        if (seen.has(article)) return;
        seen.add(article);

        
        const message = article.querySelector('[data-message-author-role="user"]');
        if (!message) return;
        const text = message.innerText.trim();
        if (!text) return;

        const testid = article.getAttribute('data-testid');
        const n = testid ? Math.floor(Number(testid.split('-').pop()) / 2 + 1) + ". " : "";

        const item = document.createElement('div');
        item.title = text;

        item.textContent = n + text.split('.')[0].slice(0, 50); 
        item.style.cursor = 'pointer';
        item.style.marginBottom = '6px';
        item.style.borderBottom = '1px solid #333';
        item.style.paddingBottom = '4px';

        item.onclick = () => {
            article.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        prompt_list.appendChild(item);
    }

    function handle_location_change() {
        // When URL changes we reset the sidebar and seen list.
        prompt_list.replaceChildren();
        seen = new WeakSet();
    }

    function handle_mutations(mutations) {
        // DOM change handler
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;

                if (node.matches?.('article[data-turn="user"]')) {
                    itemize(node)
                } else if (node.matches?.('article[data-turn="assistant"]')) {
                    addStoreButton(node);
                } else {

                    const prompts = node.querySelectorAll?.('article[data-turn="user"]');

                    for (const a of prompts) {
                        itemize(a)
                    }

                    const answers = node.querySelectorAll?.('article[data-turn="assistant"]');
                    for (const a of answers) {
                        addStoreButton(a);
                    }
                }
            }
        }
    }
})();
