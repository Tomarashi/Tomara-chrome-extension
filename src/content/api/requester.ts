import { TomaraConfiguration } from "../config.js";

class GetWordsResult {
    private readonly result: string[];
    private readonly requestId: string;

    constructor(result: string[], requestId?: string) {
        this.result = result;
        this.requestId = requestId || "";
    }

    getResult(): string[] {
        return this.result;
    }

    getRequestId(): string {
        return this.requestId;
    }

    isRequestId(): boolean {
        return this.requestId !== undefined
            && this.requestId !== null
            && this.requestId !== "";
    }
}

interface IRequester {
    check(): Promise<boolean>
    getWordsStartWith(subString: string, size: number, requestId?: string): Promise<GetWordsResult>
};

class HttpRequester implements IRequester {
    static readonly DEFAULT_SIZE = 8;

    private config: TomaraConfiguration;

    constructor(config: TomaraConfiguration) {
        this.config = config;
    }

    async check(): Promise<boolean> {
        const url = this.config.host + this.config.test_path;
        try {
            const response = await fetch(url)
                .then((response) => {
                    if(response.status !== 200) {
                        throw new Error();
                    }
                    return true;
                }).then((data) => {
                    return data;
                }).catch(() => {
                    return false;
                });
            return response;
        } catch(_) {
            return false;
        }
    }

    async getWordsStartWith(subString: string, size: number, requestId?: string): Promise<GetWordsResult> {
        size = size || HttpRequester.DEFAULT_SIZE;
        const config = this.config;
        const url = new URL(config.host + config.api_path);
        url.searchParams.set(config.word_param, subString);
        url.searchParams.set(config.size_param, size.toFixed());
        if(requestId) {
            url.searchParams.set(config.request_id_param, requestId);
        }

        try {
            const response = await fetch(url.toString());
            const result = await response.json();
            const words = result["words"] || [];
            const requestId = result["request_id"];
            return new GetWordsResult(words, requestId);
        } catch(_) {
            return new GetWordsResult([]);
        }
    }
};

class FakeRequester implements IRequester {
    async check(): Promise<boolean> {
        return true;
    }

    getWordsStartWith(subString: string, size: number, requestId?: string): Promise<GetWordsResult> {
        if(!size) {
            size = Math.floor(Math.random() * 6);
        }
        return new Promise((resolve, _) => {
            const arr = new Array(size).fill(subString).map((val, index) => {
                return val + "-" + (index + 1);
            });
            resolve(new GetWordsResult(arr, requestId));
        });
    }
};


export {
    IRequester,
    HttpRequester,
    FakeRequester,
};
