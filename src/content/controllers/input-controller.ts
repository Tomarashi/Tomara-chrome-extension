import { IRequester, HttpRequester } from "../api/requester.js";
import { Tomaraconfiguration } from "../config";
import { ISuggestionsBox, DefaultSuggestionsBox } from "../ui/suggestions-box.js";
import { ISuggestionsContainer, DefaultSuggestionsContainer } from "../ui/suggestions-container.js";
import { isLeftRightArrowKey, isUpDownArrowKey } from "../utils/keyboard-functions.js";
import { warning } from "../utils/log-functions.js";
import { splitString } from "../utils/string-functions.js";
import { createDomElementWrapper } from "../wrapper/functions.js";
import { WrapperManager } from "../wrapper/wrapper-manager.js";

const setUpController = async (
    elements: HTMLElement[], config: Tomaraconfiguration,
) => {
    const elementsSet = new Set(elements);

    const container: ISuggestionsContainer = new DefaultSuggestionsContainer();
    const wrapperManager = new WrapperManager();
    const box: ISuggestionsBox = new DefaultSuggestionsBox(container, wrapperManager);
    const requester: IRequester = new HttpRequester(config);

    if(!(await requester.check())) {
        warning("Can't find remote server");
        return;
    }

    elements.forEach((component) => {
        const wrapper = createDomElementWrapper(component);

        const inputOrClickEvent = async (srcEvent) => {
            const hideBoxEvent = (newEvent) => {
                const newTarget = newEvent.target;
                if(srcEvent !== newEvent
                && newTarget !== srcEvent.target
                && !box.isThisElement(newTarget)
                && !elementsSet.has(newTarget)) {
                    toggleSuggestionsBox();
                }
            };

            const toggleSuggestionsBox = () => {
                if(box.isShown()) {
                    box.hide();
                    document.removeEventListener("click", hideBoxEvent);
                } else {
                    box.show();
                    box.setCoordinates(wrapper.getCursorCoordinates());
                    document.addEventListener("click", hideBoxEvent);
                }
            };

            wrapperManager.setFocused(wrapper);

            if(!box.isShown()) {
                toggleSuggestionsBox();
            }
            box.setCoordinates(wrapper.getCursorCoordinates());

            const cursorPos = wrapper.getCursorPosition(srcEvent);
            const splitted = splitString(wrapper.getValue().substring(0, cursorPos));
            const lastSubstring = splitted.length === 0? "": splitted[splitted.length - 1];

            if(lastSubstring === "") {
                container.clear();
            } else {
                const result = await requester.getWordsStartsWith(lastSubstring, undefined);
                container.updateValues(...result);
            }

            if(lastSubstring !== "") {
                box.registerForUserChoice(component, (choice) => {
                    const value = wrapper.getValue();
                    const newVal = value.substring(0, cursorPos) +
                        choice.substring(lastSubstring.length) +
                        " " + value.substring(cursorPos);
                    wrapper.getWrapped().focus();
                    const newPos = wrapper.getCursorPosition(srcEvent) + lastSubstring.length + 1;

                    wrapper.setValue(newVal);
                    wrapper.setCursurPosition(newPos);
                    container.clear();
                });
            }
        };

        wrapper.on("input", inputOrClickEvent);
        wrapper.on("click", inputOrClickEvent);
        wrapper.on("keyup", (keyEvent: KeyboardEvent) => {
            const keyCode = keyEvent.keyCode;
            if(isLeftRightArrowKey(keyCode) || (!keyEvent.ctrlKey && isUpDownArrowKey(keyCode))) {
                inputOrClickEvent(keyEvent);
            }
        });
    });
};

export {
    setUpController,
};
