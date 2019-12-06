const REGEX_TRIM = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
/**
 * trim string helper
 * @param {string} theString
 */
export function trimString(theString) {
    return theString == null ? '' : (theString + '').replace(REGEX_TRIM, '');
}

/**
 * add class(es) to element
 * @param {Element} element - element to add class(es) to
 * @param {String} classes - space delimitted class(es) to add
 */
export function addClass(element, classes) {
    let currentValue = trimString(element.getAttribute && element.getAttribute('class'));
    let current = ' ' + currentValue + ' ';
    let finalValue = '';

    for (let i = 0, cs = classes.split(' '), l = cs.length; i < l; i += 1) {
        if (cs[i] !== '' && current.indexOf(' ' + cs[i] + ' ') === -1) {
            finalValue += ' ' + cs[i];
        }
    }
    if (currentValue !== (finalValue = currentValue + finalValue)) {
        element.setAttribute('class', finalValue);
    }
}

/**
 * remove class(es) from element
 * @param {Element} element - element to add class(es) to
 * @param {String} classes - space delimitted class(es) to remove
 */
export function removeClass(element, classes) {
    let currentValue = trimString(element.getAttribute && element.getAttribute('class'));
    let finalValue = ' ' + currentValue + ' ';

    for (let i = 0, cs = classes.split(' '), l = cs.length; i < l; i += 1) {
        finalValue = finalValue.replace(' ' + cs[i] + ' ', ' ');
    }
    if (currentValue !== (finalValue = trimString(finalValue))) {
        element.setAttribute('class', finalValue);
    }
}

// regex constants used for string cleaning
const REGEX_AMPERSAND = /&/g;
const REGEX_DUPE_WHITESPACE = /\s\s+/g;
const REGEX_MAKE_SAFE = /[.*+?^${}()|[\]\\]/g;
const REGEX_TO_IGNORE = /[\u2018\u2019',:\u2013-]/g;
/**
 * @description clean string of some characters, and make safe for regex searching
 * @param {String} theString
 * @returns {String}
 */
export function cleanString(theString) {
    theString = theString.replace(REGEX_TO_IGNORE, ''); // ignore quotes, commas, colons, and hyphens
    theString = theString.replace(REGEX_AMPERSAND, 'and'); // treat & and 'and' as the same
    theString = theString.replace(REGEX_MAKE_SAFE, '\\$&'); // make safe for regex searching
    theString = theString.replace(REGEX_DUPE_WHITESPACE, ' '); // ignore duplicate whitespace 
    return trimString(theString.toLowerCase()); // case insensitive
}

/**
 * @description check if keycode is for a printable/width-affecting character
 * @param {Number} keyCode 
 * @returns {Boolean}
 */
export function isPrintableKey(keyCode) {
    return (
        (keyCode >= 48 && keyCode <= 57) || // 0-9
        (keyCode >= 65 && keyCode <= 90) || // a-z
        (keyCode >= 96 && keyCode <= 111) || // numpad 0-9, numeric operators
        (keyCode >= 186 && keyCode <= 222) || // semicolon, equal, comma, dash, etc.
        keyCode === 32 || keyCode === 8 || keyCode === 46 // space, backspace, or delete
    );
}

/**
 * @description merge objects together to generate a new one
 * @param {Object} args - objects to merge together
 * @returns {Object}
 */
export function mergeObjects(...args) {
    let n = {};
    for (let i = 0, l = args.length; i < l; i += 1) {
        let o = a[i];
        for (let p in o) {
            if (o.hasOwnProperty(p) && typeof o[p] !== 'undefined') {
                n[p] = o[p];
            }
        }
    }
    return n;
}

/**
 * @description dispatch event helper
 * @param {Element} element
 * @param {String} event
 */
export function dispatchEvent(element, event) {
    if ('createEvent' in document) {
        let e = document.createEvent('HTMLEvents');
        e.initEvent(event, true, true);
        element.dispatchEvent(e);
    } else {
        element.fireEvent('on' + event);
    }
}

/**
 * @description set element option or checkbox to specified state and trigger change event
 * @param {Element} element
 * @param {Boolean} selected
 * @param {(AriaAutocomplete|Object)} instance
 */
export function setElementState(element, selected, instance) {
    selected = !!selected;
    if (element) {
        // handle checkbox
        if (element.nodeName === 'INPUT' && typeof element.checked === 'boolean' && element.checked !== selected) {
            element.checked = selected;
            dispatchEvent(element, 'change');
        }

        // handle dropdown option
        if (element.nodeName === 'OPTION' && element.selected !== selected) {
            element.selected = selected;
            // ensure change event only fires once for dropdown
            if (instance.elementChangeEventTimer) {
                clearTimeout(instance.elementChangeEventTimer);
            }
            instance.elementChangeEventTimer = setTimeout(function () {
                dispatchEvent(element.closest('select'), 'change');
            }, 1);
        }
    }
}

/**
 * @description process an array of strings or objects to ensure needed props exist
 * @param {(String|Object)[]} sourceArray
 * @param {Boolean=} setCleanedLabel - defaults to true
 * @returns {Array}
 */
export function processSourceArray(sourceArray, setCleanedLabel) {
    let toReturn = [];
    for (let i = 0, l = sourceArray.length; i < l; i += 1) {
        let result = {};
        let entry = sourceArray[i];
        // handle array of strings
        if (typeof entry === 'string') {
            result.value = entry;
            result.label = entry;
        }
        // handle array of objects - ensure value and label exist, and maintain any other properties
        else {
            result = entry;
            result.value = (result.value || result.label || '').toString();
            result.label = (result.label || result.value || '').toString();
        }
        // whether to set a cleaned label for static source filtering (in filter method)
        if (setCleanedLabel !== false) {
            result.cleanedLabel = cleanString(result.label);
        }
        toReturn.push(result);
    }
    return toReturn;
}