class ResultSet {
    readonly values: string[]

    constructor(values: string[]) {
        this.values = values;
    }
};

class EmptyInputResultSet extends ResultSet {
    constructor() {
        super(undefined);
    }
};


interface ISuggestionsContainer {
    addListener(listener: ISuggestionsContainerListener): boolean
    removeListener(listener: ISuggestionsContainerListener): boolean
    getValues(): string[]
    addValues(...values: string[]): void
    updateValues(...values: string[]): void
    clear(): void
};

interface ISuggestionsContainerListener {
    updatedContainer(resultSet: ResultSet): void
};


class DefaultSuggestionsContainer implements ISuggestionsContainer {
    private listeners: Set<ISuggestionsContainerListener>;
    private values: string[];
    private valuesWereCleaned: boolean;

    constructor() {
        this.listeners = new Set();
        this.values = [];
        this.valuesWereCleaned = true;
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
        const resultSet = (this.valuesWereCleaned)?
            new EmptyInputResultSet():
            new ResultSet(this.values);
        this.listeners.forEach((listener) => {
            listener.updatedContainer(resultSet);
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

    clear(): void {
        this.values = [];
        this.valuesWereCleaned = true;
        this.notifyListeners();
    }
};


export {
    ResultSet,
    EmptyInputResultSet,
    ISuggestionsContainer,
    ISuggestionsContainerListener,
    DefaultSuggestionsContainer,
};
