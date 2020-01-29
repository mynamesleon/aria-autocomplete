const elemProto = Element.prototype;
if (!elemProto.matches) {
    elemProto.matches = elemProto['msMatchesSelector'] || elemProto['webkitMatchesSelector'];
}

if (!elemProto.closest) {
    elemProto.closest = function(s) {
        let el = this;
        do {
            if (el.matches(s)) return el;
            el = el.parentElement || el.parentNode;
        } while (el !== null && el.nodeType === 1);
        return null;
    };
}
