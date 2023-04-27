const loadDomComponents = (...selectors: string[]): Element[] => {
    return selectors.map((inputSelector) => {
        return Array.from(document.querySelectorAll(inputSelector));
    }).flat();
};

export {
    loadDomComponents,
};
