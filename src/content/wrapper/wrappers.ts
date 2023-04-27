import { Coordinate } from "../utils/classes.js";

interface IDomElementWrapper {
    getValue(): string
    getCursorCoordinates(): Coordinate
    on(eventType: string, listener: EventListenerOrEventListenerObject): void
};

abstract class AbstractDomElementWrapper<T extends Element> implements IDomElementWrapper {
    protected events: Map<string, EventListenerOrEventListenerObject[]>;
    protected domElement: T;

    constructor(domElement: T) {
        this.events = new Map();
        this.domElement = domElement;
    }

    abstract getValue(): string

    getCursorCoordinates(): Coordinate {
        return new Coordinate(0, 0);
    }

    on(eventType: string, listener: EventListenerOrEventListenerObject): void {
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
        return (element.textContent || element.innerHTML).replace(/ +/g,' ');
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
};

class InputWrapper extends AbstractDomElementWrapper<HTMLInputElement> {
    getValue(): string {
        return this.domElement.value;
    }
};

class TextareaWrapper extends AbstractDomElementWrapper<HTMLTextAreaElement> {
    getValue(): string {
        return this.domElement.value || "";
    }
};

export {
    IDomElementWrapper,
    AbstractDomElementWrapper,
    DivWrapper,
    InputWrapper,
    TextareaWrapper,
}
