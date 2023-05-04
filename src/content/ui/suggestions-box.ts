import { Coordinate } from "../utils/classes.js";
import {
    BAD_COORDINATE,
    TAB_KEY_CODE,
    UP_ARROW_KEY_CODE,
} from "../utils/const.js";
import { getBody } from "../utils/dom-functions.js";
import { isUpDownArrowKey } from "../utils/keyboard-functions.js";
import { WrapperManager } from "../wrapper/wrapper-manager.js";
import {
    ISuggestionsContainer,
    ISuggestionsContainerListener,
    EmptyInputResultSet,
    ResultSet,
} from "./suggestions-container.js";

interface ISuggestionsBox {
    setCoordinates(coordiante: Coordinate): void
    isShown(): boolean
    show(): void
    hide(): void
    isThisElement(element: HTMLElement): boolean
    registerForUserChoice(element: HTMLElement, invoker: (choice: string) => void): void
};

namespace DefaultSuggestionsBox {
   export type UIListHolder = typeof DefaultSuggestionsBox.UIListHolder.prototype;
};

class DefaultSuggestionsBox implements ISuggestionsBox, ISuggestionsContainerListener {
    private static readonly MAIN_CLASS_NAME = "tomara-extension-suggestion-box";
    private static readonly SHOW_CLASS_NAME = "tomara-extension-suggestion-box-visible";
    private static readonly HIDE_CLASS_NAME = "tomara-extension-suggestion-box-hidden";
    private static readonly MAIN_INFO_TAG_CLASS_NAME = "tomara-extension-suggestion-box-info-tag";
    private static readonly MAIN_INFO_TAG_VISIBLE_CLASS_NAME = "tomara-extension-suggestion-box-info-tag-visible";
    private static readonly MAIN_LIST_CLASS_NAME = "tomara-extension-suggestion-box-list";
    private static readonly MAIN_LIST_ITEM_CLASS_NAME = "tomara-extension-suggestion-box-list-item";
    private static readonly MAIN_LIST_ITEM_CHOSEN_CLASS_NAME = "tomara-extension-suggestion-box-list-item-chosen";

    private static readonly INFO_TAG_TEXT_START_TYPE = "დაიწყე აკრიფე...";
    private static readonly INFO_TAG_TEXT_NO_RESULT = "შედეგი ვერ მოიძებნა ;(";

    static UIListHolder = class UIListHolder {
        readonly owner: DefaultSuggestionsBox;
        readonly list: HTMLUListElement;
        items: HTMLLIElement[];
        currIndex: number;
        values: string[];

        constructor(owner: DefaultSuggestionsBox) {
            this.owner = owner;
            this.currIndex = -1;
            this.values = null;
            this.list = document.createElement("ul");
            this.list.setAttribute("class", DefaultSuggestionsBox.MAIN_LIST_CLASS_NAME);
        }

        clear() {
            this.list.innerHTML = "";
        }

        showValues(values: string[]) {
            const buildItem = (value: string, index: number): HTMLLIElement => {
                const item = document.createElement("li");
                item.innerHTML = value;
                item.setAttribute("class", DefaultSuggestionsBox.MAIN_LIST_ITEM_CLASS_NAME);
                item.addEventListener("click", (pointerEvent: PointerEvent) => {
                    const owner = this.owner;
                    const wrapper = owner.wrapperManager.getFocused();
                    const func = owner.userChoiseEventsMap.get(wrapper.getWrapped());
                    if(func) {
                        func(this.values[index]);
                    }
                });
                return item;
            }

            this.items = [];
            if(values.length === 0) {
                this.currIndex = -1;
            } else {
                this.clear();
                this.values = [...values];
                values.map(buildItem).forEach(element => {
                    this.list.appendChild(element);
                    this.items.push(element);
                });
                this.currIndex = 0;
                this.chooseOffset(0);
            }
        }

        indexInRange(index: number): boolean {
            return 0 <= index && index < this.values.length;
        }

        chooseOffset(listOffset: number) {
            const newCurrIndex = this.currIndex + listOffset;
            if(this.indexInRange(newCurrIndex)) {
                if(this.indexInRange(this.currIndex)) {
                    this.items[this.currIndex].classList.remove(
                        DefaultSuggestionsBox.MAIN_LIST_ITEM_CHOSEN_CLASS_NAME,
                    );
                }
                this.items[newCurrIndex].classList.add(
                    DefaultSuggestionsBox.MAIN_LIST_ITEM_CHOSEN_CLASS_NAME,
                );
                this.currIndex = newCurrIndex;
                this.owner.root.scroll({top: 0});
                /*const parentRect = this.owner.root.getBoundingClientRect();
                const listItem = this.items[this.currIndex].getBoundingClientRect();
                const listItemTop = listItem.top - parentRect.top;
                const listItemBottom = listItemTop + listItem.height;

                if(listItemTop < 0) {
                    this.owner.root.scroll({top: listItemBottom});
                } else if(listItemBottom > this.owner.getHeight()) {
                    this.owner.root.scroll({top: listItemTop});
                }*/
            }
        }
    };

    private suggestionsContainer: ISuggestionsContainer;
    private wrapperManager: WrapperManager;
    private root: HTMLDivElement;
    private infoTag: HTMLParagraphElement;
    private listHolder: DefaultSuggestionsBox.UIListHolder;
    private userChoiseEventsMap: Map<HTMLElement, (_: string) => void>;
    private _isShown: boolean;

    constructor(
        suggestionsContainer: ISuggestionsContainer,
        wrapperManager: WrapperManager,
    ) {
        this.suggestionsContainer = suggestionsContainer;
        this.suggestionsContainer.addListener(this);
        this.wrapperManager = wrapperManager;
        this.listHolder = new DefaultSuggestionsBox.UIListHolder(this);
        this.root = (() => {
            const root = document.createElement("div");
            root.setAttribute("class", DefaultSuggestionsBox.MAIN_CLASS_NAME);
            root.appendChild(this.listHolder.list);
            return root;
        })();
        this.infoTag = (() => {
            const info = document.createElement("p");
            info.innerHTML = DefaultSuggestionsBox.INFO_TAG_TEXT_START_TYPE;
            info.classList.add(
                DefaultSuggestionsBox.MAIN_INFO_TAG_CLASS_NAME,
                DefaultSuggestionsBox.MAIN_INFO_TAG_VISIBLE_CLASS_NAME,
            );
            return info;
        })();
        this.root.appendChild(this.infoTag);
        this.userChoiseEventsMap = new Map();
        this.setCoordinates(BAD_COORDINATE);
        const parent = getBody();
        parent.insertBefore(this.root, parent.lastChild);
        this._isShown = true;
        this.hide();
        document.addEventListener("keydown", (keyEvent: KeyboardEvent) => {
            const keyCode = keyEvent.keyCode;
            if(keyCode === TAB_KEY_CODE) {
                const wrapper = this.wrapperManager.getFocused();
                const func = this.userChoiseEventsMap.get(wrapper.getWrapped());
                const chosenValue = this.getChosenValue();
                if(func && chosenValue) {
                    func(this.getChosenValue());
                }
                keyEvent.preventDefault();
            } else if(keyEvent.ctrlKey && isUpDownArrowKey(keyCode)) {
                const offset = (keyCode == UP_ARROW_KEY_CODE)? -1: 1;
                this.listHolder.chooseOffset(offset);
                keyEvent.preventDefault();
            }
        });
    }

    private getHeight(): number {
        const computedStyle = getComputedStyle(this.root);
        return parseFloat(computedStyle["height"]) || 0;
    }

    setCoordinates(coordiante: Coordinate): void {
        coordiante = coordiante.offset(20, 40);
        const pos = `left: ${coordiante.x}px; top: ${coordiante.y}px;`
        this.root.setAttribute("style", pos);
    }

    isShown(): boolean {
        return this._isShown;
    }

    show(): void {
        if(!this._isShown) {
            this._isShown = true;
            const classList = this.root.classList;
            classList.add(DefaultSuggestionsBox.SHOW_CLASS_NAME);
            classList.remove(DefaultSuggestionsBox.HIDE_CLASS_NAME);
        }
    }

    hide(): void {
        if(this._isShown) {
            this._isShown = false;
            const classList = this.root.classList;
            classList.add(DefaultSuggestionsBox.HIDE_CLASS_NAME);
            classList.remove(DefaultSuggestionsBox.SHOW_CLASS_NAME);
        }
    }

    isThisElement(element: HTMLElement): boolean {
        return this.root === element
            || this.infoTag === element
            || this.listHolder.items.some(item => item === element);
    }

    private getChosenValue(): string {
        return this.listHolder.values[this.listHolder.currIndex];
    }

    registerForUserChoice(element: HTMLElement, invoker: (choice: string) => void): void {
        this.userChoiseEventsMap.set(element, invoker);
    }

    updatedContainer(resultSet: ResultSet): void {
        const classList = this.infoTag.classList;
        this.listHolder.clear();
        if(resultSet instanceof EmptyInputResultSet) {
            classList.add(DefaultSuggestionsBox.MAIN_INFO_TAG_VISIBLE_CLASS_NAME);
            this.infoTag.innerHTML = DefaultSuggestionsBox.INFO_TAG_TEXT_START_TYPE;
        } else {
            this.listHolder.showValues(resultSet.values);
            this.infoTag.innerHTML = DefaultSuggestionsBox.INFO_TAG_TEXT_NO_RESULT;
            if(resultSet.values.length === 0) {
                classList.add(DefaultSuggestionsBox.MAIN_INFO_TAG_VISIBLE_CLASS_NAME);
            } else {
                classList.remove(DefaultSuggestionsBox.MAIN_INFO_TAG_VISIBLE_CLASS_NAME);
            }
        }
    }
};


export {
    ISuggestionsBox,
    DefaultSuggestionsBox,
};
