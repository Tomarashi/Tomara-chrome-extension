class ResultSet {
    readonly values?: string[]

    constructor(values?: string[]) {
        this.values = values;
    }
};


enum SuggestionsContainerState {
    WAITING,
    SEARCHING,
    SHOWING,
};


interface ISuggestionsContainer {
    addListener(listener: ISuggestionsContainerListener): boolean
    removeListener(listener: ISuggestionsContainerListener): boolean
    getValues(): string[]
    addValues(...values: string[]): void
    updateValues(...values: string[]): void
    getState(): SuggestionsContainerState
    setState(state: SuggestionsContainerState): void
    clear(): void
};

interface ISuggestionsContainerListener {
    updatedContainer(container: ISuggestionsContainer): void
};


class DefaultSuggestionsContainer implements ISuggestionsContainer {
    private listeners: Set<ISuggestionsContainerListener>;
    private values: string[];
    private valuesWereCleaned: boolean;
    private state: SuggestionsContainerState;

    constructor() {
        this.listeners = new Set();
        this.values = [];
        this.valuesWereCleaned = true;
        this.state = SuggestionsContainerState.WAITING;
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
        this.valuesWereCleaned = false;
        this.notifyListeners();
    }

    updateValues(...values: string[]): void {
        this.values = [];
        this.values.push(...values);
        this.valuesWereCleaned = false;
        this.notifyListeners();
    }

    getState(): SuggestionsContainerState {
        return this.state;
    }

    setState(state: SuggestionsContainerState) {
        this.state = state;
        this.notifyListeners();
    }

    clear(): void {
        this.values = [];
        this.valuesWereCleaned = true;
        this.state = SuggestionsContainerState.WAITING;
        this.notifyListeners();
    }
};


export {
    ResultSet,
    SuggestionsContainerState,
    ISuggestionsContainer,
    ISuggestionsContainerListener,
    DefaultSuggestionsContainer,
};
