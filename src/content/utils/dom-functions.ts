const loadDomComponents = (...selectors: string[]): Element[] => {
    return selectors.map((inputSelector) => {
        return Array.from(document.querySelectorAll(inputSelector));
    }).flat();
};

const copyStyles = (src: HTMLElement, dest: HTMLElement) => {
    Object.entries(getComputedStyle(src)).forEach(([key, value]) => {
        dest.style.setProperty(key, value);
    });
};

export {
    loadDomComponents,
    copyStyles,
};
