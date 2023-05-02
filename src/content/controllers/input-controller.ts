import { IRequester, FakeRequester } from "../api/requester.js";
import { ISuggestionsBox, DefaultSuggestionsBox } from "../ui/suggestions-box.js";
import { ISuggestionsContainer, DefaultSuggestionsContainer } from "../ui/suggestions-container.js";
import { isLeftRightArrowKey, isUpDownArrowKey } from "../utils/keyboard-functions.js";
import { splitString } from "../utils/string-functions.js";
import { createDomElementWrapper } from "../wrapper/functions.js";
import { WrapperManager } from "../wrapper/wrapper-manager.js";

const setUpController = (elements: HTMLElement[]) => {
    const elementsSet = new Set(elements);

    const container: ISuggestionsContainer = new DefaultSuggestionsContainer();
    const wrapperManager = new WrapperManager();
    const box: ISuggestionsBox = new DefaultSuggestionsBox(container, wrapperManager);
    const requester: IRequester = new FakeRequester();

    elements.forEach((component) => {
        const wrapper = createDomElementWrapper(component);

        const inputOrClickEvent = (srcEvent) => {
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

            const cursorPos = wrapper.getCursurPosition(srcEvent);
            const splitted = splitString(wrapper.getValue().substring(0, cursorPos));
            const lastSubstring = splitted.length === 0? "": splitted[splitted.length - 1];

            if(lastSubstring === "") {
                container.clear();
            } else {
                container.updateValues(
                    ...requester.getWordsStartsWith(lastSubstring, undefined),
                );
            }

            (() => {
                if(lastSubstring === "") {
                    return;
                }
                box.registerForUserChoice(component, (choice) => {
                    const value = wrapper.getValue();
                    const newVal = value.substring(0, cursorPos) +
                        choice.substring(lastSubstring.length) +
                        value.substring(cursorPos);
                    console.log(newVal);
                });
            })();
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
