import {
	Coordinate
} from "../utils/classes.js";
import {
	BAD_COORDINATE,
	TAB_KEY_CODE,
	UP_ARROW_KEY_CODE,
} from "../utils/const.js";
import {
	getBody
} from "../utils/dom-functions.js";
import {
	isUpDownArrowKey
} from "../utils/keyboard-functions.js";
import {
	WrapperManager
} from "../wrapper/wrapper-manager.js";
import {
	ISuggestionsBox
} from "./suggestions-box.js";
import {
	ISuggestionsContainer,
	ISuggestionsContainerListener,
    SuggestionsContainerState,
} from "./suggestions-container.js";

const MAIN_CLASS_NAME = "tomara-extension-suggestion-box";
const SHOW_CLASS_NAME = "tomara-extension-suggestion-box-visible";
const HIDE_CLASS_NAME = "tomara-extension-suggestion-box-hidden";
const MAIN_INFO_TAG_CLASS_NAME = "tomara-extension-suggestion-box-info-tag";
const MAIN_INFO_TAG_VISIBLE_CLASS_NAME = "tomara-extension-suggestion-box-info-tag-visible";
const MAIN_LIST_CLASS_NAME = "tomara-extension-suggestion-box-list";
const MAIN_LIST_ITEM_CLASS_NAME = "tomara-extension-suggestion-box-list-item";
const MAIN_LIST_ITEM_CHOSEN_CLASS_NAME = "tomara-extension-suggestion-box-list-item-chosen";

const INFO_TAG_TEXT_START_TYPE = "დაიწყე კრეფა...";
const INFO_TAG_TEXT_SEARCHING = "იძებნება...";
const INFO_TAG_TEXT_NO_RESULT = "შედეგი ვერ მოიძებნა ;(";


namespace DefaultSuggestionsBox {
	export type UIListHolder = typeof DefaultSuggestionsBox.UIListHolder.prototype;
};

class DefaultSuggestionsBox implements ISuggestionsBox, ISuggestionsContainerListener {
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
			this.list.setAttribute("class", MAIN_LIST_CLASS_NAME);
		}

		clear() {
			this.list.innerHTML = "";
		}

		showValues(values: string[]) {
			const buildItem = (value: string, index: number): HTMLLIElement => {
				const item = document.createElement("li");
				item.innerHTML = value;
				item.setAttribute("class", MAIN_LIST_ITEM_CLASS_NAME);
				item.addEventListener("click", (_: PointerEvent) => {
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

		chooseOffset(listOffset: number): boolean {
			const newCurrIndex = this.currIndex + listOffset;
			const inRange = this.indexInRange(newCurrIndex);
			if(inRange) {
				if(this.indexInRange(this.currIndex)) {
					this.items[this.currIndex].classList.remove(
						MAIN_LIST_ITEM_CHOSEN_CLASS_NAME,
					);
				}
				this.items[newCurrIndex].classList.add(
					MAIN_LIST_ITEM_CHOSEN_CLASS_NAME,
				);
				this.currIndex = newCurrIndex;
				this.owner.root.scroll({
					top: 0
				});
			}
			return inRange;
		}

		getCurrentItem(): HTMLLIElement {
			return this.items[this.currIndex];
		}
	};

	private suggestionsContainer: ISuggestionsContainer;
	private wrapperManager: WrapperManager;
	private root: HTMLDivElement;
	private infoTag: HTMLParagraphElement;
	private listHolder: DefaultSuggestionsBox.UIListHolder;
	private userChoiseEventsMap: Map < HTMLElement, (_: string) => void > ;
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
			root.setAttribute("class", MAIN_CLASS_NAME);
			root.appendChild(this.listHolder.list);
			return root;
		})();
		this.infoTag = (() => {
			const info = document.createElement("p");
			info.innerHTML = INFO_TAG_TEXT_START_TYPE;
			info.classList.add(
				MAIN_INFO_TAG_CLASS_NAME,
				MAIN_INFO_TAG_VISIBLE_CLASS_NAME,
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
				const offset = (keyCode == UP_ARROW_KEY_CODE) ? -1 : 1;
				const changed = this.listHolder.chooseOffset(offset);

				if(changed) {
					const item = this.listHolder.getCurrentItem();
					const rootBRect = this.root.getBoundingClientRect();
					const itemBRect = item.getBoundingClientRect();
					this.root.scrollTop = Math.round(itemBRect.y - rootBRect.y);
					keyEvent.preventDefault();
				}
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
			classList.add(SHOW_CLASS_NAME);
			classList.remove(HIDE_CLASS_NAME);
		}
	}

	hide(): void {
		if(this._isShown) {
			this._isShown = false;
			const classList = this.root.classList;
			classList.add(HIDE_CLASS_NAME);
			classList.remove(SHOW_CLASS_NAME);
		}
	}

	isThisElement(element: HTMLElement): boolean {
		return this.root === element ||
			this.infoTag === element ||
			this.listHolder.items.some(item => item === element);
	}

	private getChosenValue(): string {
		return this.listHolder.values[this.listHolder.currIndex];
	}

	registerForUserChoice(element: HTMLElement, invoker: (choice: string) => void): void {
		this.userChoiseEventsMap.set(element, invoker);
	}

	updatedContainer(container: ISuggestionsContainer): void {
		const classList = this.infoTag.classList;
		this.listHolder.clear();
		if(container.getState() === SuggestionsContainerState.WAITING) {
			classList.add(MAIN_INFO_TAG_VISIBLE_CLASS_NAME);
			this.infoTag.innerHTML = INFO_TAG_TEXT_START_TYPE;
		} else if(container.getState() === SuggestionsContainerState.SEARCHING) {
			classList.add(MAIN_INFO_TAG_VISIBLE_CLASS_NAME);
			this.infoTag.innerHTML = INFO_TAG_TEXT_SEARCHING;
		} else {
            const values = container.getValues();
			this.listHolder.showValues(values);
			this.infoTag.innerHTML = INFO_TAG_TEXT_NO_RESULT;
			if(values.length === 0) {
				classList.add(MAIN_INFO_TAG_VISIBLE_CLASS_NAME);
			} else {
				classList.remove(MAIN_INFO_TAG_VISIBLE_CLASS_NAME);
			}
		}
	}
};

export {
	DefaultSuggestionsBox
};