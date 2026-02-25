(function () {
    'use strict';

    let seen = new WeakSet();

    const sidebar = document.createElement('div');
    style_sidebar();
    const store = document.createElement('div');
    sidebar.appendChild(store);
    const separator = document.createElement('div');
    separator.innerHTML = `
            <div style="font-weight:bold; margin-bottom:8px;">
                Prompts
            </div>`;
    sidebar.appendChild(separator);
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
        // console.log(document.style);
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
    }

    function addStoreButton(answer_node, prompt_node) {
        // Adds a "store" button to the answer
        // TODO: fill in the onclick functionality
        if (answer_node.querySelector('.tm-store-btn')) return;

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

        answer_node.appendChild(btn);
    }


    function itemize(article) {
        // Adds a quicklink to the "prompts" sidebar

        const message = article.querySelector('[data-message-author-role="user"]');


        console.log('data-message-id:' + message.getAttribute?.('data-message-id'));
        if (!message) return;
        const text = message.innerText.trim();
        if (!text) return;
        // Get prompt number or ""
        const testid = article.getAttribute('data-testid');
        const n = testid ? Math.floor(Number(testid.split('-').pop()) / 2 + 1) + ". " : "";

        const item = document.createElement('div');
        item.title = text;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = n;
        item.appendChild(checkbox);

        const text_item = document.createElement('span');
        text_item.textContent = n + text.split('.')[0].slice(0, 50); 
        text_item.style.cursor = 'pointer';
        text_item.style.marginBottom = '6px';
        text_item.style.borderBottom = '1px solid #333';
        text_item.style.paddingBottom = '4px';
        text_item.onclick = () => {
            article.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        item.appendChild(text_item);

        prompt_list.appendChild(item);
    }

    function handle_location_change() {
        // When URL changes, reset the sidebar and seen list.
        prompt_list.replaceChildren();
        seen = new WeakSet();
    }

    function handle_mutations(mutations) {
        // DOM change handler
        for (const m of mutations) {
            for (const node of m.addedNodes) {
                if (!(node instanceof HTMLElement)) continue;

                if (seen.has(node)) continue;

                if (node.matches?.('article')) {
                    seen.add(node);
                    if (node.getAttribute('data-turn') === 'user') {
                        itemize(node);
                    }
                } else {
                    const articles = node.querySelectorAll?.('article');
                    for (const a of articles) {
                        if (seen.has(a)) continue;

                        seen.add(a);
                        if (a.getAttribute('data-turn') === 'user') {
                            itemize(a);
                        }
                    }
                }
            }
        }
    }
})();
