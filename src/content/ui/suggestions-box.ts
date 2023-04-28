import { Coordinate } from "../utils/classes.js";
import { getBody } from "../utils/dom-functions.js";
import {
    ISuggestionsContainer,
    ISuggestionsContainerListener,
} from "./suggestions-container.js";

interface ISuggestionsBox {
    setCoordinates(coordiante: Coordinate): void
    isShown(): boolean
    show(): void
    hide(): void
    asHTMLElement(): HTMLElement
};

class DefaultSuggestionsBox implements ISuggestionsBox, ISuggestionsContainerListener {
    private static readonly MAIN_CLASS_NAME = "tomara-extension-suggestion-box";
    private static readonly SHOW_CLASS_NAME = "tomara-extension-suggestion-box-visible";
    private static readonly HIDE_CLASS_NAME = "tomara-extension-suggestion-box-hidden";
    private suggestionsContainer: ISuggestionsContainer;
    private root: HTMLDivElement;
    private _isShown: boolean;

    constructor(suggestionsContainer: ISuggestionsContainer) {
        this.suggestionsContainer = suggestionsContainer;
        this.suggestionsContainer.addListener(this);
        this.root = document.createElement("div");
        this.setCoordinates(new Coordinate(0, 0));
        this.root.setAttribute("class", DefaultSuggestionsBox.MAIN_CLASS_NAME);
        const parent = getBody();
        parent.insertBefore(this.root, parent.lastChild);
        this._isShown = true;
        this.hide();
    }

    setCoordinates(coordiante: Coordinate): void {
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

    asHTMLElement(): HTMLElement {
        return this.root;
    }

    updatedContainer(container: ISuggestionsContainer): void {
        const values = container.getValues();
    }
};


export {
    ISuggestionsBox,
    DefaultSuggestionsBox,
};
