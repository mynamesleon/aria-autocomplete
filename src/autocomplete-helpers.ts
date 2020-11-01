import { CLEANED_LABEL_PROP, UNESCAPED_HTML_REGEX, HTML_REPLACEMENTS } from './autocomplete-constants';

/**
 * remove start and end whitespace from string
 */
export function trimString(theString?: any): string {
    return theString == null ? '' : (theString + '').trim();
}

/**
 * convert &, <, >, ", and ' in a string to their HTML entities
 */
export function escapeHtml(value: string): string {
    if (typeof value !== 'string' || !value) {
        return '';
    }
    return value.replace(UNESCAPED_HTML_REGEX, (character) => HTML_REPLACEMENTS[character]);
}

const REGEX_AMPERSAND = /&/g;
const REGEX_DUPE_WHITESPACE = /\s\s+/g;
const REGEX_TO_IGNORE = /[\u2018\u2019',:\u2013-]/g;
const REGEX_MAKE_SAFE = /[\-\[\]{}()*+?.,\\\^$|#\s]/g;
/**
 * clean a string to make searchable
 */
export function cleanString(theString: string, makeSafeForRegex: boolean = false): string {
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
 * merge objects together to generate a new one
 */
export function mergeObjects(...args: any[]): any {
    const result = {};
    args.forEach((obj) => {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && typeof obj[prop] !== 'undefined') {
                result[prop] = obj[prop];
            }
        }
    });
    return result;
}

/**
 * trigger an event on an element
 */
export function dispatchEvent(element: HTMLElement, event: string) {
    if ('createEvent' in document) {
        const htmlEvents = document.createEvent('HTMLEvents');
        htmlEvents.initEvent(event, true, true);
        element.dispatchEvent(htmlEvents);
    } else {
        (element as any).fireEvent('on' + event);
    }
}

/**
 * get element children as an Array
 */
export function getChildrenOf(element: HTMLElement): HTMLElement[] {
    if (!element || !element.children) {
        return [];
    }
    return Array.prototype.slice.call(element.children);
}

/**
 * set element option or checkbox to specified state and trigger change event
 */
export function setElementState(element: HTMLInputElement | HTMLOptionElement, selected: boolean, instance: any) {
    selected = !!selected;
    if (element) {
        // handle checkbox
        if (element.nodeName === 'INPUT' && 'checked' in element && element.checked !== selected) {
            element.checked = selected;
            dispatchEvent(element, 'change');
        }

        // handle dropdown option
        if (element.nodeName === 'OPTION' && 'selected' in element && element.selected !== selected) {
            element.selected = selected;
            // ensure change event only fires once for dropdown
            clearTimeout(instance.elementChangeEventTimer);
            instance.elementChangeEventTimer = setTimeout(function () {
                dispatchEvent(element.closest('select'), 'change');
            }, 1);
        }
    }
}

/**
 * process a results entry string or object to ensure needed props exist
 */
export function processSourceEntry(entry: string | any, mapping: any = {}): any {
    let result: any = {};
    const mapValue = mapping['value'];
    const mapLabel = mapping['label'];
    if (typeof entry === 'string') {
        result.value = result.label = entry;
    } else {
        // generate new object to not modify original
        // ensure value and label exist, and maintain any other properties
        result = mergeObjects(entry);
        result.value = (result[mapValue] || result.value || result.label || '').toString();
        result.label = (result[mapLabel] || result.label || result.value || '').toString();
    }
    // set a cleaned label for static source filtering (in filter method)
    result[CLEANED_LABEL_PROP] = cleanString(result.label);
    return result;
}

/**
 * process an array of strings or objects to ensure needed props exist
 */
export function processSourceArray(sourceArray: any[], mapping: any = {}): any[] {
    if (!Array.isArray(sourceArray)) {
        return sourceArray ? [sourceArray] : [];
    }
    return sourceArray.map((entry: string | any) => processSourceEntry(entry, mapping));
}

/**
 * check if string contains text (partial, safe match)
 */
function searchStringFor(toCheck: string, toSearchFor: string, name?: string): boolean {
    if (name !== CLEANED_LABEL_PROP) {
        toCheck = cleanString(toCheck, false);
    }
    return toCheck.search(toSearchFor) !== -1;
}

/**
 * search String or Array for another string - partial match
 */
function searchPropFor(prop: string | string[], toSearchFor: string, name?: string): boolean {
    if (typeof prop === 'string') {
        return searchStringFor(prop, toSearchFor, name);
    }
    if (Array.isArray(prop)) {
        for (let i = 0, l = prop.length; i < l; i += 1) {
            if (searchPropFor(prop[i], toSearchFor)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * check through object's String or String[] properties for query match
 */
export function searchSourceEntryFor(toSearchIn: Object, toSearchFor: string, propsToSearch: string[]): boolean {
    for (const i in toSearchIn) {
        if (!toSearchIn.hasOwnProperty(i)) {
            continue;
        }
        const entry = toSearchIn[i];
        // allow searching only on strings and arrays
        const proceed: boolean =
            (typeof entry === 'string' || Array.isArray(entry)) && propsToSearch.indexOf(i) > -1;

        if (proceed && searchPropFor(entry, toSearchFor, i)) {
            return true;
        }
    }
    return false;
}

/**
 * remove duplicate array entries, and `label`
 */
export function prepSearchInArray(arr: any[]): string[] {
    // remove `label` (we will be using CLEANED_LABEL_PROP) and duplicates from props array
    const result: string[] = [];
    arr.forEach((entry: any) => {
        if (typeof entry !== 'string') {
            return;
        }
        // check that the array entry is not 'label' first
        const str = trimString(entry);
        let proceed = str !== 'label';
        // now check through result array to make sure it is not a duplicate
        for (let i = 0, l = result.length; proceed && i < l; i += 1) {
            proceed = result[l] !== str;
        }
        if (proceed) {
            result.push(str);
        }
    });
    return result;
}
