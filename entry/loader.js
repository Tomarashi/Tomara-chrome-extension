(function() {
    const manifest = chrome.runtime.getManifest();
    const webResources = manifest.web_accessible_resources || [];
    const resources = webResources.map((obj) => obj["resources"] || []).flat();
    const jsResources = resources.filter((res) => {
        return res.toLowerCase().endsWith(".js")
    });
    const head = document.head || document.getElementsByTagName("head")[0];
    jsResources.forEach(jsRes => {
        const url = chrome.runtime.getURL(jsRes);
        const scriptTag = document.createElement("script");
        scriptTag.setAttribute("type", "module");
        scriptTag.setAttribute("src", url);
        head.insertBefore(scriptTag, head.lastChild);
    });
})();
