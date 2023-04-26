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
    textInputs.forEach((component) => {
        console.log(component);
    });
};

(function() {
    window.addEventListener("load", main);
})();
