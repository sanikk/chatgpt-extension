(function () {
    'use strict';

    let seen = new WeakSet();

    const sidebar = document.createElement('div');
    sidebar.id = 'tm-jump-sidebar';

    const controls_area = document.createElement('div');
    const buttons_row = document.createElement('div');
    const btnStore = document.createElement('button');
    btnStore.textContent = 'Store';
    btnStore.className = 'big-button';
    const btnReset = document.createElement('button');
    btnReset.textContent = 'Reset';
    btnReset.className = 'big-button';
    buttons_row.append(btnStore, btnReset);

    const lists_row = document.createElement('div');
    const listAvailable = document.createElement('select');
    listAvailable.className = 'tag-list';
    listAvailable.multiple = true;

    const middleButtons = document.createElement('div');

    const inputTag = document.createElement('input');
    inputTag.type = 'text';
    inputTag.placeholder = 'New tag';
    inputTag.maxLength = 64;
    inputTag.id = 'tag-input';

    const btnCreate = document.createElement('button');
    btnCreate.textContent = 'Create';
    btnCreate.className = 'tag-button';
    btnCreate.addEventListener('click', async () => { 
        const tag = inputTag.value.trim();
        if (!tag) return;
        const ret = await browser.runtime.sendMessage({
            type: 'createTag',
            name: tag
        });
        if (ret) {
            optionize_tag(ret);
        }
        inputTag.value = '';
    });

    const btnAdd = document.createElement('button');
    btnAdd.textContent = 'Add →';
    btnAdd.className = 'tag-button';
    const btnRemove = document.createElement('button');
    btnRemove.textContent = '← Remove';
    btnRemove.className = 'tag-button';
    middleButtons.append(btnCreate, inputTag, btnAdd, btnRemove);

    const listPicked = document.createElement('select');
    listPicked.className = 'tag-list';
    listPicked.multiple = true;

    lists_row.append(listAvailable, middleButtons, listPicked);
    controls_area.append(buttons_row, lists_row);
    sidebar.appendChild(controls_area);

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
        window.navigation.addEventListener("navigate", (event) => {
            handle_location_change();
        });
    }
    loadTags();

    function optionize_tag(tag) {
        // Makes a tag row into an <option> for <select>
            const { id, name } = tag;
            const opt = document.createElement('option');
            opt.value = id;
            opt.textContent = name;
            listAvailable.appendChild(opt);
    }

    async function loadTags() {
        // Loads tags from the backend
        try {
            listAvailable.replaceChildren();
            const tags = await browser.runtime.sendMessage({ type: "getTags" });

            for (const tag of tags) {
                optionize_tag(tag);
            }
        } catch (err) {
            console.error('Failed to load tags:', err);
        }
    }

    function itemize(article) {
        // Adds a quicklink to the "prompts" sidebar

        const prompt = article.querySelector('[data-message-author-role="user"]');
        if (!prompt) return;
        const prompt_text = prompt.innerText.trim();
        if (!prompt_text) return;

        const item = document.createElement('div');
        item.title = prompt_text;
        // const data_message_id = prompt.getAttribute?.('data-message-id'));
        const testid = article.getAttribute('data-testid');
        const n = testid ? Math.floor(Number(testid.split('-').pop()) / 2 + 1) + ". " : "";

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = n;
        item.appendChild(checkbox);

        const text_item = document.createElement('span');

        text_item.textContent = n + prompt_text.split('.')[0].slice(0, 50); 
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
