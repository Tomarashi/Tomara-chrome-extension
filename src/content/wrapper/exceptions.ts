class UnknownHTMLElement extends Error {
    constructor(tagName: string) {
        super("Unknown tag: " + tagName);
    }
};

export {
    UnknownHTMLElement,
};
