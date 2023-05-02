import { Coordinate } from "./classes.js";

const BAD_COORDINATE = new Coordinate(Number.MIN_SAFE_INTEGER);
const ZERO_COORDINATE = new Coordinate(0);

const TAB_KEY_CODE = 9;
const LEFT_ARROW_KEY_CODE = 37;
const UP_ARROW_KEY_CODE = 38;
const RIGHT_ARROW_KEY_CODE = 39;
const DOWN_ARROW_KEY_CODE = 40;

export {
    BAD_COORDINATE,
    ZERO_COORDINATE,
    TAB_KEY_CODE,
    LEFT_ARROW_KEY_CODE,
    UP_ARROW_KEY_CODE,
    RIGHT_ARROW_KEY_CODE,
    DOWN_ARROW_KEY_CODE,
};
