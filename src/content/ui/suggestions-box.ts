import { Coordinate } from "../utils/classes.js";

interface ISuggestionsBox {
    setCoordinates(coordiante: Coordinate): void
    isShown(): boolean
    show(): void
    hide(): void
    isThisElement(element: HTMLElement): boolean
    registerForUserChoice(element: HTMLElement, invoker: (choice: string) => void): void
};

export {
    ISuggestionsBox,
};
