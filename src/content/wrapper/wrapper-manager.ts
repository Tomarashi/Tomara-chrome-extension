import { IDomElementWrapper } from "./wrappers";

class WrapperManager {
    private focusedWrapper: IDomElementWrapper;

    constructor() {
        this.focusedWrapper = null;
    }

    getFocused(): IDomElementWrapper {
        return this.focusedWrapper;
    }

    setFocused(wrapper: IDomElementWrapper) {
        this.focusedWrapper = wrapper;
    }

    unfocus() {
        this.focusedWrapper = null;
    }
};


export {
    WrapperManager,
}
