const loadTextInputs = function() {
    return [
        "textarea",
        "input[type='text']",
        "div[contenteditable='true']",
    ].map((inputSelector) => {
        return Array.from(document.querySelectorAll(inputSelector));
    }).flat();
};

const main = function() {
    const textInputs = loadTextInputs();
    const typeListener = new TypeListener();
    textInputs.forEach((component) => {
        typeListener.addListenable(component);
    });
};

(function() {
    window.addEventListener("load", main);
})();
