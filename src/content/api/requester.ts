import { Tomaraconfiguration } from "../config.js";
import { log } from "../utils/log-functions.js";

interface IRequester {
    check(): Promise<boolean>
    getWordsStartsWith(subString: string, size: number): Promise<string[]>
};

class HttpRequester implements IRequester {
    static readonly DEFAULT_SIZE = 8;

    private config: Tomaraconfiguration;
    private totalResult: number;
    private totalTimeNs: number;

    constructor(config: Tomaraconfiguration) {
        this.config = config;
        this.totalResult = 0;
        this.totalTimeNs = 0;
    }

    async check(): Promise<boolean> {
        const url = this.config.host + this.config.test_path;
        try {
            const response = await fetch(url).then((response) => {
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

    async getWordsStartsWith(subString: string, size: number): Promise<string[]> {
        size = size || HttpRequester.DEFAULT_SIZE;
        const url = new URL(this.config.host + this.config.api_path);
        url.searchParams.set(this.config.word_param, subString);
        url.searchParams.set(this.config.size_param, size.toFixed());

        try {
            const response = await fetch(url.toString());
            const result = await response.json();
            const words = result["words"] || [];
            if(words.length > 0) {
                this.totalResult += 1;
                this.totalTimeNs += result["taken_ns"] || 0;
                if(this.totalResult > 0 && this.totalResult % 1000 === 0) {
                    log(`Average Time: ${this.totalTimeNs / this.totalResult} ns.`);
                }
            }
            return words;
        } catch(_) {
            return [];
        }
    }
};

class FakeRequester implements IRequester {
    async check(): Promise<boolean> {
        return true;
    }

    getWordsStartsWith(subString: string, size: number = undefined): Promise<string[]> {
        if(!size) {
            size = Math.floor(Math.random() * 6);
        }
        return new Promise((resolve, _) => {
            const arr = new Array(size).fill(subString).map((val, index) => {
                return val + "-" + (index + 1);
            });
            resolve(arr);
        });
    }
};


export {
    IRequester,
    HttpRequester,
    FakeRequester,
};
