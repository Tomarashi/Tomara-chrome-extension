import { Coordinate } from "../utils/classes.js";
import {
    copyStyles,
    getBody,
} from "../utils/dom-functions.js";
import { WrapperManager } from "./wrapper-manager";

interface IDomElementWrapper {
    getWrapped(): HTMLElement
    getValue(): string
    setValue(newValue: string): void
    getCursorCoordinates(): Coordinate
    getCursurPosition(event: Event): number
    on(eventType: string | string[], listener: EventListenerOrEventListenerObject): void
};

abstract class AbstractDomElementWrapper<T extends HTMLElement> implements IDomElementWrapper {
    protected events: Map<string, EventListenerOrEventListenerObject[]>;
    protected domElement: T;
    protected wrapperManager: WrapperManager;

    constructor(domElement: T, wrapperManager: WrapperManager = null) {
        this.events = new Map();
        this.domElement = domElement;
        this.wrapperManager = wrapperManager;
    }

    getWrapped(): HTMLElement {
        return this.domElement;
    }

    abstract getValue(): string

    abstract setValue(newValue: string): void

    abstract getCursorCoordinates(): Coordinate

    abstract getCursurPosition(event: Event): number

    on(eventType: string | string[], listener: EventListenerOrEventListenerObject): void {
        if(Array.isArray(eventType)) {
            return eventType.forEach(eType => {
                this.on(eType, listener);
            });
        }
        this.domElement.addEventListener(eventType, listener);
        if(!this.events.has(eventType)) {
            this.events.set(eventType, []);
        }
        this.events.get(eventType).push(listener);
    }
};

class DivWrapper extends AbstractDomElementWrapper<HTMLDivElement> {
    getValue(): string {
        const element = this.domElement;
        return (element.textContent || element.innerHTML).replace(/ +/g," ");
    }

    setValue(newValue: string): void {
        const element = this.domElement;
        if(element.textContent) {
            element.textContent = newValue;
        } else if(element.innerHTML) {
            element.innerHTML = newValue;
        }
    }

    getCursorCoordinates(): Coordinate {
        const range = window.getSelection().getRangeAt(0);
        const startNode = range.startContainer;
        const startOffset = range.startOffset;
        const newRange = document.createRange();
        newRange.setStart(startNode, startOffset);
        newRange.setEnd(startNode, startOffset);
        const rect = newRange.getBoundingClientRect();
        return new Coordinate(rect.x, rect.y);
    }

    getCursurPosition(_: Event): number {
        return document.getSelection().getRangeAt(0).endOffset;
    }
};

class InputWrapper extends AbstractDomElementWrapper<HTMLInputElement> {
    getValue(): string {
        return this.domElement.value;
    }

    setValue(newValue: string): void {
        this.domElement.value = newValue;
    }

    getCursorCoordinates(): Coordinate {
        const input = this.domElement;
        const div = document.createElement("div");
        const span = document.createElement("span");
        const body = getBody();

        copyStyles(input, div);
        div.textContent = this.getValue().substring(0, input.selectionStart);
        div.appendChild(span);
        body.appendChild(div);

        const [
            divPos,
            spanPos,
            inputPos,
        ] = [div, span, input].map(e => e.getBoundingClientRect());

        body.removeChild(div);
        return new Coordinate(
            inputPos.x + spanPos.x - divPos.x,
            inputPos.y + spanPos.y - divPos.y,
        );
    }

    getCursurPosition(event: Event): number {
        return (event.target as any).selectionStart;
    }
};

class TextareaWrapper extends AbstractDomElementWrapper<HTMLTextAreaElement> {
    private static readonly CLASS_FIELDS_TO_COPY = [
        "padding", "fontFamily",
        "fontSize", "fontWeight",
        "wordWrap", "whiteSpace",
        "borderLeftWidth", "borderTopWidth",
        "borderRightWidth", "borderBottomWidth",
    ];

    getValue(): string {
        return this.domElement.value || "";
    }

    setValue(newValue: string): void {
        this.domElement.value = newValue;
    }

    getCursorCoordinates(): Coordinate {
        const getLineHeightInPixels = (element: HTMLTextAreaElement): number => {
            const styles = getComputedStyle(element);
            const lineHeight = styles.lineHeight;
            if (lineHeight === "normal") {
                const span = document.createElement("span");
                span.style.fontSize = styles.fontSize;
                span.style.fontFamily = styles.fontFamily;
                span.textContent = "T";
                element.parentNode.appendChild(span);
                const normalHeight = span.offsetHeight;
                element.parentNode.removeChild(span);
                return normalHeight;
            }
            return parseFloat(lineHeight);
        };

        const textArea = this.domElement;
        const div = document.createElement("div");
        const span = document.createElement("span");
        const body = getBody();
        const value = this.getValue();
        const lines = value.replace(/ /g, ".").split("\n");

        copyStyles(textArea, div);
        div.textContent = lines[lines.length - 1].substring(0, textArea.selectionStart);
        div.appendChild(span);
        body.appendChild(div);

        const [
            divPos,
            spanPos,
            inputPos,
        ] = [div, span, textArea].map(e => e.getBoundingClientRect());
        const lineHeight = (lines.length - 1) * getLineHeightInPixels(textArea);

        body.removeChild(div);
        return new Coordinate(
            inputPos.x + spanPos.x - divPos.x,
            inputPos.y + spanPos.y - divPos.y + lineHeight,
        );
    }

    getCursurPosition(event: Event): number {
        return (event.target as any).selectionStart;
    }
};

export {
    IDomElementWrapper,
    AbstractDomElementWrapper,
    DivWrapper,
    InputWrapper,
    TextareaWrapper,
}
