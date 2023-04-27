import { UnknownHTMLElement } from "./exceptions.js";
import {
    IDomElementWrapper,
    InputWrapper,
    DivWrapper,
    TextareaWrapper,
} from "./wrappers.js";

const createDomElementWrapper = (domElement: HTMLElement): IDomElementWrapper => {
    const tagName = domElement.tagName.toLocaleLowerCase();
    if(tagName === "input") {
        return new InputWrapper(domElement as HTMLInputElement);
    } else if(tagName === "div") {
        return new DivWrapper(domElement as HTMLDivElement);
    } else if(tagName === "textarea") {
        return new TextareaWrapper(domElement as HTMLTextAreaElement);
    }
    throw new UnknownHTMLElement(domElement.tagName);
};

export {
    createDomElementWrapper,
};
