(function() {
    Array.prototype.filterWithExtention = function(fileExtention) {
        return this.filter(file => file.toLowerCase().endsWith(fileExtention));
    };

    const url = (res) => chrome.runtime.getURL(res);
    const createElement = (tagName, attrs = {}) => {
        const tag = document.createElement(tagName);
        Object.keys(attrs).forEach(key => {
            tag.setAttribute(key, attrs[key]);
        });
        return tag;
    };

    const manifest = chrome.runtime.getManifest();
    const webResources = manifest.web_accessible_resources || [];
    const resources = webResources.map((obj) => obj["resources"] || []).flat();

    const head = document.head || document.getElementsByTagName("head")[0];
    resources.filterWithExtention(".js").forEach(res => {
        const scriptTag = createElement("script", {
            type: "module",
            src: url(res),
        });
        head.insertBefore(scriptTag, head.lastChild);
    });
    resources.filterWithExtention(".css").forEach(res => {
        const linkTag = createElement("link", {
            rel: "stylesheet",
            href: url(res),
        });
        head.insertBefore(linkTag, head.lastChild);
    });

    Array.prototype.filterWithExtention = undefined;
})();
