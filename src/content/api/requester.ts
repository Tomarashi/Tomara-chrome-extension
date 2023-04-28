interface IRequester {
    getWordsStartsWith(subString: string, size: number): string[]
};

class HttpRequester implements IRequester {
    static readonly DEFAULT_SIZE = 8;
    getWordsStartsWith(subString: string, size: number): string[] {
        throw new Error("Method not implemented.");
    }
};

class FakeRequester implements IRequester {
    getWordsStartsWith(subString: string, size: number = undefined): string[] {
        if(!size) {
            size = 5 + Math.floor(Math.random() * 10);
        }
        return new Array(size).fill(subString).map((val, index) => {
            return val + "-" + (index + 1);
        });
    }
};


export {
    IRequester,
    HttpRequester,
    FakeRequester,
};
