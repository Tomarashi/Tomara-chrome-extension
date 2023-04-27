interface IDomElementWrapper {
    getValue(): string
};

abstract class AbstractDomElementWrapper<T extends Element> implements IDomElementWrapper {
    protected domElement: T;

    constructor(domElement: T) {
        this.domElement = domElement;
        this.domElement.addEventListener("input", () => {
            console.log(this.getValue())
        });
    }

    abstract getValue(): string
};

class DivWrapper extends AbstractDomElementWrapper<HTMLDivElement> {
    getValue(): string {
        const element = this.domElement;
        return (element.textContent || element.innerHTML).replace(/ +/g,' ');
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
