import {
    LEFT_ARROW_KEY_CODE,
    UP_ARROW_KEY_CODE,
    RIGHT_ARROW_KEY_CODE,
    DOWN_ARROW_KEY_CODE,
} from "../utils/const.js";

const isLeftRightArrowKey = (keyCode: number) => {
    return keyCode === LEFT_ARROW_KEY_CODE || keyCode === RIGHT_ARROW_KEY_CODE;
};

const isUpDownArrowKey = (keyCode: number) => {
    return keyCode === UP_ARROW_KEY_CODE || keyCode === DOWN_ARROW_KEY_CODE;
};

const isArrowKey = (keyCode: number) => {
    return LEFT_ARROW_KEY_CODE <= keyCode && keyCode <= DOWN_ARROW_KEY_CODE;
};


export {
    isLeftRightArrowKey,
    isUpDownArrowKey,
    isArrowKey,
};
