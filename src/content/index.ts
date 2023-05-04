import { setUpController } from "./controllers/input-controller.js";
import { loadDomComponents } from "./utils/dom-functions.js";
import config from "./config.js";

const main = function() {
    const selectors = [
        "textarea",
        "input[type='text']",
        "div[contenteditable='true']",
    ];
    const textInputElements = loadDomComponents(...selectors).map(elemenet => {
        return elemenet as HTMLElement;
    });
    setUpController(textInputElements, config);
};

(function() {
    window.addEventListener("load", main);
})();
