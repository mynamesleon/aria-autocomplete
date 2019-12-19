/**
 * @description trim string helper
 * @param {string} theString
 */
export function trimString(theString) {
    return theString == null ? '' : (theString + '').trim();
}

/**
 * @description check if element has class - support pre `classList`
 * @param {Element} element - element to check class on
 * @param {String} className
 * @returns {Boolean}
 */
export function hasClass(element, className) {
    const e = element;
    const cur = trimString(e.getAttribute && e.getAttribute('class'));
    return ` ${cur} `.indexOf(` ${className} `) > -1;
}

/**
 * @description add class(es) to element - support pre `classList`
 * @param {Element} element - element to add class(es) to
 * @param {String} classes - space delimitted class(es) to add
 */
export function addClass(element, classes) {
    const currentValue = trimString(
        element.getAttribute && element.getAttribute('class')
    );
    const current = ' ' + currentValue + ' ';
    let finalValue = '';

    for (let i = 0, cs = classes.split(' '), l = cs.length; i < l; i += 1) {
        if (cs[i] !== '' && current.indexOf(' ' + cs[i] + ' ') === -1) {
            finalValue += ' ' + cs[i];
        }
    }
    if (currentValue !== (finalValue = trimString(currentValue + finalValue))) {
        element.setAttribute('class', finalValue);
    }
}

/**
 * @description remove class(es) from element - support pre `classList`
 * @param {Element} element - element to add class(es) to
 * @param {String} classes - space delimitted class(es) to remove
 */
export function removeClass(element, classes) {
    const currentValue = trimString(
        element.getAttribute && element.getAttribute('class')
    );
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
const REGEX_TO_IGNORE = /[\u2018\u2019',:\u2013-]/g;
const REGEX_MAKE_SAFE = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;
/**
 * @description clean string of some characters, and make safe for regex searching
 * @param {String} theString
 * @param {Boolean=} makeSafeForRegex
 * @returns {String}
 */
export function cleanString(theString, makeSafeForRegex = false) {
    theString = trimString(theString)
        .toLowerCase() // case insensitive
        .replace(REGEX_TO_IGNORE, '') // ignore quotes, commas, colons, and hyphens
        .replace(REGEX_AMPERSAND, 'and') // treat & and 'and' as the same
        .replace(REGEX_DUPE_WHITESPACE, ' '); // ignore duplicate whitespace
    // make safe for regex searching
    if (makeSafeForRegex) {
        theString = theString.replace(REGEX_MAKE_SAFE, '\\$&');
    }
    return theString;
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
        keyCode === 32 || // space
        keyCode === 8 || // backspace
        keyCode === 46 // delete
    );
}

/**
 * @description merge objects together to generate a new one
 * @param {Object} args - objects to merge together
 * @returns {Object}
 */
export function mergeObjects(...args) {
    const n = {};
    for (let i = 0, l = args.length; i < l; i += 1) {
        const o = args[i];
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
        const htmlEvents = document.createEvent('HTMLEvents');
        htmlEvents.initEvent(event, true, true);
        element.dispatchEvent(htmlEvents);
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
        if (
            element.nodeName === 'INPUT' &&
            typeof element.checked === 'boolean' &&
            element.checked !== selected
        ) {
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
            instance.elementChangeEventTimer = setTimeout(function() {
                dispatchEvent(element.closest('select'), 'change');
            }, 1);
        }
    }
}

/**
 * @description process an array of strings or objects to ensure needed props exist
 * @param {(String|Object)[]} sourceArray
 * @param {Object=} mapping - value and label mapping used in object cases
 * @param {Boolean=} setCleanedLabel - defaults to true
 * @returns {Array}
 */
export function processSourceArray(sourceArray, mapping = {}, setCleanedLabel) {
    const toReturn = [];
    const mapValue = mapping['value'];
    const mapLabel = mapping['label'];
    for (let i = 0, l = sourceArray.length; i < l; i += 1) {
        let result = {};
        let entry = sourceArray[i];
        // handle array of strings
        if (typeof entry === 'string') {
            result.value = result.label = entry;
        }
        // handle array of objects - ensure value and label exist, and maintain any other properties
        else {
            // generate new object to not modify original
            result = mergeObjects(entry);
            const value = result[mapValue] || result.value || result.label;
            const label = result[mapLabel] || result.label || result.value;
            result.value = (value || '').toString();
            result.label = (label || '').toString();
        }
        // whether to set a cleaned label for static source filtering (in filter method)
        if (setCleanedLabel !== false) {
            result.ariaAutocompleteCleanedLabel = cleanString(result.label);
        }
        toReturn.push(result);
    }
    return toReturn;
}

const DIV = document.createElement('div');
/**
 * @description convert HTML string into an element
 * @param {String} html
 * @returns {Element}
 */
export function htmlToElement(html) {
    DIV.innerHTML = trimString(html);
    return DIV.firstChild;
}

/**
 * @description set styles on an element
 * @param {Element} element
 * @param {Object} s
 */
export function setCss(element, s) {
    if (!element) {
        return;
    }
    for (let i in s) {
        const style = typeof s[i] === 'number' ? s[i] + 'px' : s[i];
        element.style[i] = style + ''; // force to be a string
    }
}

/**
 * @description transfer styles from one Element to another
 * @param {Element} from
 * @param {Element} to
 * @param {Array=} properties
 */
export function transferStyles(from, to, properties) {
    if (!from || !to) {
        return;
    }
    const fromStyles = getComputedStyle(from);
    let styles = {};

    if (properties && properties.length) {
        for (let i = 0, l = properties.length; i < l; i += 1) {
            styles[properties[i]] = fromStyles[properties[i]];
        }
    } else {
        styles = fromStyles;
    }

    setCss(to, styles);
}

/**
 * @description search String or Array for another string - partial match
 * @param {String|Array} prop
 * @param {String} regexSafeQuery
 * @param {String=} name
 */
const searchPropFor = (prop, regexSafeQuery, name) => {
    if (typeof prop === 'string') {
        if (name !== 'ariaAutocompleteCleanedLabel') {
            prop = cleanString(prop, false);
        }
        return prop.search(regexSafeQuery) !== -1;
    } else if (Array.isArray(prop)) {
        for (let i = 0, l = prop.length; i < l; i += 1) {
            if (searchPropFor(prop[i], regexSafeQuery)) {
                return true;
            }
        }
    }
    return false;
};
/**
 * @description check through object's String or String[] properties for query match
 * @param {Object} obj
 * @param {String[]} props
 * @param {String} query
 * @param {Boolean=} makeQuerySafe
 * @returns {Boolean}
 */
export function searchVarPropsFor(obj, props, query, makeQuerySafe = false) {
    if (makeQuerySafe) {
        query = cleanString(query, true);
    }

    for (let i in obj) {
        if (obj.hasOwnProperty(i)) {
            let proceed = false;
            // check if obj property is a string, and if property name is in props Array
            if (typeof obj[i] === 'string') {
                // use while loop instead of indexOf for performance in older browsers
                let l = props.length;
                while (l--) {
                    if (props[l] === i) {
                        proceed = true;
                        break;
                    }
                }
            } else {
                // if not a string, only allow Arrays otherwise
                proceed = Array.isArray(obj[i]);
            }
            if (proceed && searchPropFor(obj[i], query, i)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * @description remove duplicate array entries, and `label`
 * @param {Array} arr
 * @returns {String[]}
 */
export function removeDuplicatesAndLabel(arr) {
    // remove `label` (we will be using `ariaAutocompleteCleanedLabel`) and duplicates from props array
    const result = [];
    for (let i = 0, l = arr.length; i < l; i += 1) {
        if (typeof arr[i] !== 'string') {
            continue;
        }
        const str = trimString(arr[i]);
        let proceed = str !== 'label';
        let j = result.length;
        while (proceed && j--) {
            if (result[j] === str) {
                proceed = false;
            }
        }
        if (proceed) {
            result.push(str);
        }
    }
    return result;
}
