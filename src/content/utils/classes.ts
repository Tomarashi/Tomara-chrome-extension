interface Pair<K, V> {
    getKey(): K
    setKey(newKey: K): void
    getValue(): V
    setValue(newValue: V): void
};

class MutablePair<K, V> implements Pair<K, V> {
    private key: K;
    private value: V;

    constructor(key: K, value: V) {
        this.key = key;
        this.value = value;
    }

    getKey(): K {
        return this.key;
    }

    setKey(newKey: K): void {
        this.key = newKey;
    }

    getValue(): V {
        return this.value;
    }

    setValue(newValue: V): void {
        this.value = newValue;
    }
};


class Coordinate {
    readonly x: number;
    readonly y: number;

    constructor(x: number = undefined, y: number = undefined) {
        if(!x) x = 0;
        if(!y) y = x;
        this.x = x;
        this.y = y;
    }

    offset(xOffset: number, yOffset: number): Coordinate {
        return new Coordinate(
            this.x + xOffset,
            this.y + yOffset,
        );
    }
};


export {
    Pair,
    MutablePair,
    Coordinate,
};
