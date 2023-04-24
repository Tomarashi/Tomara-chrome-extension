const TypeListener = function TypeListener() {
    const body = document.body || document.getElementsByTagName("body")[0];

    const _listenables = [];

    const _isTagWithName = (tag, tagName) => {
        return tag.tagName?.toUpperCase() === tagName.toUpperCase();
    };
    const _isInputTag = (tag) => _isTagWithName(tag, "input");
    const _isTextareaTag = (tag) => _isTagWithName(tag, "textarea");
    const _isDivTag = (tag) => _isTagWithName(tag, "div");

    const _getLastSubstring = (value) => {
        const substrings = value.split(/\s+/);
        return (substrings.length === 0)? "": substrings[substrings.length - 1];
    };

    const _getInputValue = (input) => {
        let value = "";
        if(_isInputTag(input)) {
            value = input.value;
        } else if(_isTextareaTag(input)) {
            value = input.value;
        } else if(_isDivTag(input)) {
            value = (input.textContent || input.innerHTML).toString().replace(/ +/g,' ');
        }
        return value || "";
    };

    const _getCursorPosition = function(input) {
        const {
            selectionEnd,
            offsetLeft: inputX,
            offsetTop: inputY,
        } = input;
        const div = document.createElement("div");
        const span = document.createElement("span");
        const inputValue = (() => {
            let tmp = _getInputValue(input);
            if(_isInputTag(input)) {
                tmp = tmp.replace(/ /g, ".");
            }
            return tmp;
        })();

        div.textContent = inputValue.substring(0, selectionEnd);
        span.textContent = inputValue.substring(selectionEnd) || '.';

        Object.entries(getComputedStyle(input)).forEach(([key, value]) => {
            div.style[key] = value;
        });
        if(_isInputTag(input)) {
            div.style.width = "auto";
        } else if(_isTextareaTag(input)) {
            div.style.height = "auto";
        } else if(_isDivTag(input)) {
            div.style.width = div.style.height = "auto";
        }

        div.appendChild(span);
        body.appendChild(div);

        const {
            offsetLeft: spanX,
            offsetTop: spanY,
        } = span;

        body.removeChild(div);

        return {
            x: inputX + spanX,
            y: inputY + spanY,
        };
    };

    const _createSuggestionsBox = function(initContent) {
        const box = document.createElement("div");
        box.classList.add("sityvis-tomara-extension-suggestions-box");
        box.textContent = initContent;
        return box;
    };

    const _interactionListener = function(event) {
        const _processClick = function(subEvent) {
            if(subEvent !== event && event.target !== subEvent.target) {
                _toggleBox();
            }
        };

        const _toggleBox = function() {
            input._is_suggestions_view_shown = !input._is_suggestions_view_shown;
            if(input._is_suggestions_view_shown && !input._suggestions_view) {
                input._suggestions_view = _createSuggestionsBox();
                body.appendChild(input._suggestions_view);
                document.addEventListener("click", _processClick);
            } else {
                body.removeChild(input._suggestions_view);
                document.removeEventListener("click", _processClick);
                input._suggestions_view = null;
            }
        };

        const input = event.target;
        if(input) {
            if (!input._is_suggestions_view_shown) {
                _toggleBox();
            }

            if (input._is_suggestions_view_shown) {
                const {
                    offsetLeft,
                    offsetTop,
                    offsetHeight,
                    offsetWidth,
                    scrollLeft,
                    scrollTop,
                } = input;
                const {
                    lineHeight,
                    paddingRight,
                } = getComputedStyle(input);
                const {
                    x: inputX,
                    y: inputY,
                } = _getCursorPosition(input);

                const newLeftPosition = Math.min(
                    inputX - scrollLeft,
                    offsetLeft + offsetWidth//  - parseInt(paddingRight, 10),
                );
                const newTopPosition = Math.min(
                    inputY - scrollTop,
                    offsetTop + offsetHeight//  - parseInt(lineHeight, 10),
                );

                const viewPositionStyleString = `left: ${newLeftPosition}px; top: ${newTopPosition}px`;
                input._suggestions_view.setAttribute("style", viewPositionStyleString);

                const inputValue = _getInputValue(input);
                input._suggestions_view.innerHTML = (() => {
                    let tmp = _getLastSubstring(inputValue);
                    if(tmp === "") {
                        tmp = "<i>Write something...</i>"
                    }
                    return tmp;
                })();
            }
        }
    };

    this.addListenable = function(component) {
        _listenables.push(component);
        component.addEventListener("input", _interactionListener);
        component.addEventListener("click", _interactionListener);
    };

    this.getListenables = function() {
        return _listenables;
    };
};
