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

const getHead = (): HTMLHeadElement => {
    return document.head
        || document.getElementsByTagName("head")[0] as HTMLHeadElement;
};

const getBody = (): HTMLBodyElement => {
    return document.body as HTMLBodyElement
        || document.getElementsByTagName("body")[0] as HTMLBodyElement;
};

export {
    loadDomComponents,
    copyStyles,
    getHead,
    getBody,
};
