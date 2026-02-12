(function () {
    'use strict';

    function waitForElement(selector, cb) {
        const el = document.querySelector(selector);
        if (el) {
            cb(el);
            return;
        }

        const obs = new MutationObserver(() => {
            const el = document.querySelector(selector);
            if (el) {
                obs.disconnect();
                cb(el);
            }
        });

        obs.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    let current_path = location.pathname;
    console.log("current_path initial value: ", current_path);

    waitForElement('#main', (main) => {
        console.log("waitForElement #main fired");
        const sidebar = document.createElement('div');
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
            </div>
        `;

        document.body.appendChild(sidebar);

        const seen = new WeakSet();

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
            const textDiv = article.querySelector('div.whitespace-pre-wrap');
            if (!textDiv) return;

            const text = textDiv.innerText.trim();
            if (!text) return;

            const testid = article.getAttribute('data-testid');
            const n = Math.floor(Number(testid.split('-').pop()) / 2 + 1);


            const item = document.createElement('div');
            item.title = text;
            item.textContent = n + " " + text.split('\n')[0].slice(0, 50); // first line preview
            item.style.cursor = 'pointer';
            item.style.marginBottom = '6px';
            item.style.borderBottom = '1px solid #333';
            item.style.paddingBottom = '4px';

            item.onclick = () => {
                article.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };

            sidebar.appendChild(item);
        }


        console.log('observer attaching');



        const observer = new MutationObserver((mutations) => {
            console.log("MutationObserver fired! path: ", location.pathname);
            if (current_path != location.pathname) {
                console.log('path changed! old path:', current_path);
                current_path = location.pathname;
                console.log('new path: ', current_path);
            }
            for (const m of mutations) {
                for (const node of m.addedNodes) {
                    if (!(node instanceof HTMLElement)) continue;

                    // Direct article
                    if (node.matches?.('article[data-turn="user"]')) {
                        itemize(node)
                    } else if (node.matches?.('article[data-turn="assistant"]')) {
                        addStoreButton(node);
                    }

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
    });

    observer.observe(main, {
        childList: true,
        subtree: true
    });
});

})();
