browser.runtime.onMessage.addListener(async (msg) => {
    if (msg.type === "getTags") {
        const res = await fetch("http://localhost:8000/tags");
        return await res.json();
    }
    if (msg.type === 'createTag') {
        return fetch('http://localhost:8000/tags', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: msg.name })
        })
        .then(async (r) => {
            if (!r.ok) {
                const text = await r.text();
                throw new Error(`HTTP ${r.status}: ${text}`);
            }
            return r.json();
        })
    }
});
