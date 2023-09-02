import { IRequester, HttpRequester, FakeRequester } from "../api/requester.js";
import { TomaraConfiguration } from "../config";
import { DefaultSuggestionsBox } from "../ui/suggestions-box-default.js";
import { ISuggestionsBox } from "../ui/suggestions-box.js";
import { ISuggestionsContainer, DefaultSuggestionsContainer, SuggestionsContainerState } from "../ui/suggestions-container.js";
import { isLeftRightArrowKey, isUpDownArrowKey } from "../utils/keyboard-functions.js";
import { warning, log } from "../utils/log-functions.js";
import { isGeorgianWithPunct } from "../utils/string-functions.js";
import { createDomElementWrapper } from "../wrapper/functions.js";
import { WrapperManager } from "../wrapper/wrapper-manager.js";

const setUpController = async (
    elements: HTMLElement[], config: TomaraConfiguration,
) => {
    const elementsSet = new Set(elements);

    const container: ISuggestionsContainer = new DefaultSuggestionsContainer();
    const wrapperManager = new WrapperManager();
    const box: ISuggestionsBox = new DefaultSuggestionsBox(container, wrapperManager);
    const requester: IRequester = new FakeRequester();//new HttpRequester(config);

    if(await requester.check()) {
        log("Remote server is found!");
    } else {
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
            const lastToken = wrapper.getLastToken(srcEvent);

            if(lastToken === "" || !isGeorgianWithPunct(lastToken)) {
                container.clear();
            } else {
                container.setState(SuggestionsContainerState.SEARCHING);
                const result = await requester.getWordsStartWith(lastToken, HttpRequester.DEFAULT_SIZE);
                container.updateValues(...result.getResult());
                container.setState(SuggestionsContainerState.SHOWING);
            }

            if(lastToken !== "") {
                box.registerForUserChoice(component, (choice) => {
                    wrapper.getWrapped().focus();
                    const value = wrapper.getValue();
                    const newVal = (() => {
                        const valueEnd = value.substring(cursorPos);
                        return value.substring(0, cursorPos)
                            + choice.substring(lastToken.length)
                            + (valueEnd.startsWith(" ")? "": " ")
                            + valueEnd;
                    })();
                    const newPos = wrapper.getCursorPosition(srcEvent)
                        + choice.length - lastToken.length + 1;

                    /*(() => {
                        const arr = [];
                        let lastIndex = 0;
                        while(true) {
                            const sIndex = text.indexOf("<", lastIndex);
                            if(sIndex < 0) break;
                            const eIndex = text.indexOf(">", sIndex + 1);
                            lastIndex = eIndex + 1;
                            // console.log(text.slice(sIndex, eIndex + 1));
                        }
                        arr.push(text.slice(lastIndex));
                        // console.log(arr);
                    })();*/
                    /*const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        const newText = document.createTextNode(choice.substring(lastToken.length) + " ");
                        range.insertNode(newText);
                        range.setStartAfter(newText);
                        range.collapse(true);
                        selection.removeAllRanges();
                        selection.addRange(range);
                        console.log("Inserted: " + newText.data);
                    }*/
                    (() => {
                        const caretPosition = window.getSelection().getRangeAt(0);
                        const insertedText = 'Inserted Text ';
                        const newText = document.createTextNode(insertedText);

                        caretPosition.deleteContents();
                        caretPosition.insertNode(newText);

                        const newCaretPosition = document.createRange();
                        newCaretPosition.setStartAfter(newText);
                        newCaretPosition.collapse(true);

                        const inputEvent = new Event('input', { bubbles: true });
                        component.dispatchEvent(inputEvent);

                        const selection = window.getSelection();
                        selection.removeAllRanges();
                        selection.addRange(newCaretPosition);

                        console.log([
                            caretPosition.startOffset,
                            caretPosition.endOffset,
                            insertedText.length,
                        ]);
                    })();
                    // wrapper.setValue(newVal);
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
