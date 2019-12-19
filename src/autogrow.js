import { isPrintableKey, setCss, transferStyles } from './autocomplete-helpers';

/**
 * @description storage for element used to detect value width
 */
let testSpan;

/**
 * @description set an input element to autogrow based on its value
 * @param {Element} input
 */
export default class AutoGrow {
    constructor(input) {
        this.input = input;
        this.currentString;
        this.eventHandler;
        this.currentWidth;
        this.init();
    }

    /**
     * @description trigger an autogrow check
     */
    trigger() {
        this.checkAndSet.call(this);
    }

    /**
     * @description get current user selection from within the input
     */
    getInputSelection() {
        const result = {};
        if ('selectionStart' in this.input) {
            result.start = this.input.selectionStart;
            result.length = this.input.selectionEnd - result.start;
        } else if (document.selection) {
            this.input.focus();
            const selection = document.selection.createRange();
            const selectionLength = selection.text.length;
            selection.moveStart('character', -this.input.value.length);
            result.start = selection.text.length - selectionLength;
            result.length = selectionLength;
        }
        return result;
    }

    /**
     * @description measure the pixel width of a string in an input
     * @param {String} str
     * @returns {Number}
     */
    measureString(str) {
        if (!str) {
            this.currentString = str;
            return 0;
        }

        // check for matching string
        // risky, as styles could change between checks, but better for performance
        if (str === this.currentString) {
            return this.currentWidth;
        }

        if (!testSpan) {
            testSpan = document.createElement('span');
            setCss(testSpan, {
                position: 'absolute',
                top: -99999,
                left: -99999,
                width: 'auto',
                padding: 0,
                whiteSpace: 'pre'
            });
            document.body.appendChild(testSpan);
        }

        testSpan.textContent = str;
        this.currentString = str;

        transferStyles(this.input, testSpan, [
            'letterSpacing',
            'fontSize',
            'fontFamily',
            'fontWeight',
            'textTransform'
        ]);

        return testSpan.offsetWidth || testSpan.clientWidth;
    }

    /**
     * @description check the current input value and set width
     * @param {Event} event
     */
    checkAndSet(event = {}) {
        if (event.metaKey || event.altKey) {
            return;
        }

        let value = this.input.value;
        if (event.type && event.type.toLowerCase() === 'keydown') {
            const keyCode = event.keyCode;
            const keyCodeIsDelete = keyCode === 46;
            const keyCodeIsBackspace = keyCode === 8;

            // delete or backspace
            if (keyCodeIsDelete || keyCodeIsBackspace) {
                const selection = this.getInputSelection();
                if (selection.length) {
                    value =
                        value.substring(0, selection.start) +
                        value.substring(selection.start + selection.length);
                } else if (keyCodeIsBackspace && selection.start) {
                    value =
                        value.substring(0, selection.start - 1) +
                        value.substring(selection.start + 1);
                } else if (keyCodeIsDelete && selection.start !== undefined) {
                    value =
                        value.substring(0, selection.start) +
                        value.substring(selection.start + 1);
                }
            }

            // any other width affecting character
            else if (isPrintableKey(keyCode)) {
                let character = String.fromCharCode(keyCode);
                if (event.shiftKey) {
                    character = character.toUpperCase();
                } else {
                    character = character.toLowerCase();
                }
                value += character;
            }
        }

        let placeholder;
        if (!value && (placeholder = this.input.getAttribute('placeholder'))) {
            value = placeholder;
        }

        const width = this.measureString(value) + 4;
        if (width !== this.currentWidth) {
            this.currentWidth = width;
            this.input.style.width = `${width}px`;
        }
    }

    /**
     * @description destroy the autogrow behaviour
     */
    destroy() {
        this.input.removeEventListener('blur', this.eventHandler);
        this.input.removeEventListener('input', this.eventHandler);
        this.input.removeEventListener('keyup', this.eventHandler);
        this.input.removeEventListener('keydown', this.eventHandler);
        this.input = null;
    }

    /**
     * @description initialise the autogrow behaviour and bind events
     */
    init() {
        this.checkAndSet();
        this.eventHandler = this.checkAndSet.bind(this);
        this.input.addEventListener('blur', this.eventHandler);
        this.input.addEventListener('input', this.eventHandler);
        this.input.addEventListener('keyup', this.eventHandler);
        this.input.addEventListener('keydown', this.eventHandler);
    }
}
