const GEORGIAN_WITH_PUNCT = /^[\u10D0-\u10FF,\.!?\s-]+$/;
const ASCII_LETTERS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const ASCII_AND_DIGITS = ASCII_LETTERS + DIGITS;


const splitString = (value: string): string[] => {
    return value.split(/\s+/g);
};

const isGeorgianWithPunct = (value: string): boolean => {
    return GEORGIAN_WITH_PUNCT.test(value);
};

const randomString = (n: number): string => {
    const randomNumber = (): number => {
        return Math.floor(Math.random() * ASCII_AND_DIGITS.length);
    };
    const result = [];

    if(n < 1) n = 1;
    for(let i = 0; i < n; i++) {
        result.push(ASCII_AND_DIGITS[randomNumber()]);
    }
    return result.join("");
}

export {
    splitString,
    isGeorgianWithPunct,
    randomString,
};