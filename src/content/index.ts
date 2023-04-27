import { loadDomComponents } from "./utils/dom-functions.js";
import { createDomElementWrapper } from "./wrapper/functions.js"

const main = function() {
    const selectors = [
        "textarea",
        "input[type='text']",
        "div[contenteditable='true']",
    ];
    const textInputs = loadDomComponents(...selectors);
    textInputs.forEach((component) => {
        createDomElementWrapper(component as HTMLElement);
    });
};

(function() {
    window.addEventListener("load", main);
})();
