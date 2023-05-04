const nowToString = ((): string => {
    const fillToZeroes = (n: number, toSize: number = 2) => {
        const nStr = n.toFixed();
        const result = new Array(toSize - nStr.length).fill("0");
        result.push(nStr);
        return result.join("");
    };

    const date = new Date();
    const year = date.getFullYear().toFixed();
    const month = fillToZeroes(date.getMonth());
    const day = fillToZeroes(date.getDay());
    const hours = fillToZeroes(date.getHours());
    const minutes = fillToZeroes(date.getMinutes());
    const seconds = fillToZeroes(date.getSeconds());
    return `${year}:${month}:${day} ${hours}:${minutes}:${seconds}`;
});

const warning = (data: string) => {
    const date = nowToString();
    console.warn(`[Tomara][${date}] ${data}`);
};

const log = (data: string) => {
    console.log(data);
};


export {
    warning,
    log,
};
