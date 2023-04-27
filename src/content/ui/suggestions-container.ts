interface ISuggestionsContainer {
    addListener(listener: ISuggestionsContainerListener): boolean
    removeListener(listener: ISuggestionsContainerListener): boolean
    getValues(): string[]
    addValues(...values: string[]): void
    updateValues(...values: string[]): void
    clear(): void
};

interface ISuggestionsContainerListener {
    updatedContainer(container: ISuggestionsContainer): void
};


class DefaultSuggestionsContainer implements ISuggestionsContainer {
    private listeners: Set<ISuggestionsContainerListener>;
    private values: string[];

    constructor() {
        this.listeners = new Set();
        this.values = [];
    }

    addListener(listener: ISuggestionsContainerListener): boolean {
        const oldSize = this.listeners.size;
        this.listeners.add(listener);
        return this.listeners.size !== oldSize;
    }

    removeListener(listener: ISuggestionsContainerListener): boolean {
        const oldSize = this.listeners.size;
        this.listeners.delete(listener);
        return this.listeners.size !== oldSize;
    }

    getValues(): string[] {
        return this.values;
    }

    private notifyListeners(): void {
        this.listeners.forEach((listener) => {
            listener.updatedContainer(this);
        });
    }

    addValues(...values: string[]): void {
        this.values.push(...values);
        this.notifyListeners();
    }

    updateValues(...values: string[]): void {
        this.values = [];
        this.values.push(...values);
        this.notifyListeners();
    }

    clear(): void {
        this.values = [];
        this.notifyListeners();
    }
};


export {
    ISuggestionsContainer,
    ISuggestionsContainerListener,
    DefaultSuggestionsContainer,
};
