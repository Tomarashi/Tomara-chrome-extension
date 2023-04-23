const TypeListener = function TypeListener() {
    const _listenables = [];

    this.addListenable = function(component) {
        _listenables.push(component);
    }

    this.getListenables = function() {
        return _listenables;
    };
};
