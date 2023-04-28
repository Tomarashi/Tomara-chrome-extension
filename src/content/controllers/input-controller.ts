import { FakeRequester } from "../api/requester.js";
import { DefaultSuggestionsBox } from "../ui/suggestions-box.js";
import { DefaultSuggestionsContainer } from "../ui/suggestions-container.js";
import { isArrowKey } from "../utils/keyboard-functions.js";
import { splitString } from "../utils/string-functions.js";
import { createDomElementWrapper } from "../wrapper/functions.js";

const setUpController = (elements: HTMLElement[]) => {
    const elementsSet = new Set(elements);

    const container = new DefaultSuggestionsContainer();
    const box = new DefaultSuggestionsBox(container);
    const requester = new FakeRequester();

    elements.forEach((component) => {
        const wrapper = createDomElementWrapper(component);

        const inputOrClickEvent = (srcEvent) => {
            const hideBoxEvent = (newEvent) => {
                const newTarget = newEvent.target;
                if(srcEvent !== newEvent
                && newTarget !== srcEvent.target
                && newTarget !== box.asHTMLElement()
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
                    ...requester.getWordsStartsWith(lastSubstring),
                );
            }
        };

        wrapper.on("input", inputOrClickEvent);
        wrapper.on("click", inputOrClickEvent);
        wrapper.on("keyup", (keyEvent: any) => {
            if(isArrowKey(keyEvent.keyCode)) {
                inputOrClickEvent(keyEvent);
            }
        });
    });
};

export {
    setUpController,
};
