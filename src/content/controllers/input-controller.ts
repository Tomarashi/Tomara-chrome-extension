import { DefaultSuggestionsBox } from "../ui/suggestions-box.js";
import { createDomElementWrapper } from "../wrapper/functions.js";

const setUpController = (elements: HTMLElement[]) => {
    const box = new DefaultSuggestionsBox();
    elements.forEach((component) => {
        const wrapper = createDomElementWrapper(component);

        const inputOrClickEvent = (srcEvent) => {
            const hideBoxEvent = (newEvent) => {
                if(srcEvent !== newEvent && newEvent.target !== srcEvent.target) {
                    toggleSuggestionsBox();
                }
            };

            const toggleSuggestionsBox = () => {
                if(box.isShown()) {
                    box.hide();
                    document.addEventListener("click", hideBoxEvent);
                } else {
                    box.show();
                    box.setCoordinates(wrapper.getCursorCoordinates());
                    document.removeEventListener("click", hideBoxEvent);
                }
            };

            if(!box.isShown()) {
                toggleSuggestionsBox();
            } else {
                box.setCoordinates(wrapper.getCursorCoordinates());
            }
        };

        wrapper.on("input", inputOrClickEvent);
        wrapper.on("click", inputOrClickEvent);
    });
};

export {
    setUpController,
};
