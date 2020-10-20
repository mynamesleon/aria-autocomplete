import isPrintableKey from 'is-printable-keycode';
import InputAutoWidth from 'input-autowidth';
import removeClass from 'element-removeclass';
import addClass from 'element-addclass';

import { IAriaAutocompleteOptions } from './aria-autocomplete-types';
import AutocompleteOptions from './autocomplete-options';
import AutocompleteApi from './autocomplete-api';
import AutocompleteIds from './autocomplete-ids';
import './closest-polyfill';

import {
    KEYCODES,
    API_STORAGE_PROP,
    CLEANED_LABEL_PROP,
    SELECTED_OPTION_PROP,
    ORIGINALLY_LABEL_FOR_PROP,
    ORIGINALLY_LABEL_ID_PROP,
} from './autocomplete-constants';

import {
    trimString,
    cleanString,
    mergeObjects,
    dispatchEvent,
    getChildrenOf,
    setElementState,
    prepSearchInArray,
    processSourceArray,
    searchSourceEntryFor,
} from './autocomplete-helpers';

export default class Autocomplete {
    // related explicitly to core initialising params
    options: IAriaAutocompleteOptions;
    element: HTMLElement | HTMLInputElement | HTMLSelectElement;
    elementIsInput: boolean;
    elementIsSelect: boolean;
    elementHasLabel: boolean;

    // elements
    list: HTMLUListElement;
    input: HTMLInputElement;
    wrapper: HTMLDivElement;
    showAll: HTMLSpanElement;
    srAnnouncements: HTMLSpanElement;

    // non elements
    api: AutocompleteApi;
    ids: AutocompleteIds;
    xhr: XMLHttpRequest;
    term: string;
    source: string | any[] | Function;
    menuOpen: boolean;
    multiple: boolean;
    disabled: boolean;
    autoGrow: boolean;
    isFocused: boolean;
    selected: any[];
    filtering: boolean;
    cssNameSpace: string;
    forceShowAll: boolean;
    filteredSource: Object[]; // filtered source items to render
    currentListHtml: string;
    inputPollingValue: string;
    deletionsDisabled: boolean;
    currentSelectedIndex: number; // for storing index of currently focused option

    // document click
    documentClick: EventListenerObject;
    documentClickBound: boolean;

    // timers
    filterTimer: ReturnType<typeof setTimeout>;
    pollingTimer: ReturnType<typeof setTimeout>;
    showAllPrepTimer: ReturnType<typeof setTimeout>;
    announcementTimer: ReturnType<typeof setTimeout>;
    announcementEmptyTimer: ReturnType<typeof setTimeout>;
    componentBlurTimer: ReturnType<typeof setTimeout>;
    elementChangeEventTimer: ReturnType<typeof setTimeout>;

    // storage for InputAutoWidth class instance
    inputAutoWidth: any;

    constructor(element: HTMLElement, options?: IAriaAutocompleteOptions) {
        // fail silently if no original element provided
        if (!element) {
            return;
        }

        // get going!
        this.init(element, options);
    }

    /**
     * trigger callback in component options
     */
    triggerOptionCallback(name: string, args: any[] = [], context: any = this.api) {
        if (typeof this.options[name] === 'function') {
            return this.options[name].apply(context, args);
        }
    }

    /**
     * show element with CSS only - if none provided, set list state to visible
     */
    show(element?: HTMLElement) {
        if (element) {
            removeClass(element, `${this.cssNameSpace}--hide hide hidden`);
            element.removeAttribute('aria-hidden');
            element.removeAttribute('hidden');
            return;
        }

        this.input.setAttribute('aria-expanded', 'true');
        if (this.showAll) {
            const expanded = (!!this.forceShowAll).toString();
            this.showAll.setAttribute('aria-expanded', expanded);
        }
        if (!this.menuOpen) {
            this.show(this.list);
            this.menuOpen = true;
            this.triggerOptionCallback('onOpen', [this.list]);
            if (!this.documentClickBound) {
                this.documentClickBound = true;
                document.addEventListener('click', this.documentClick);
            }
        }
    }
    /**
     * hide element with CSS only - if none provided, set list state to hidden
     */
    hide(element?: HTMLElement) {
        if (element) {
            addClass(element, `${this.cssNameSpace}--hide hide hidden`);
            element.setAttribute('aria-hidden', 'true');
            element.setAttribute('hidden', 'hidden');
            return;
        }

        this.currentSelectedIndex = -1;
        this.input.setAttribute('aria-expanded', 'false');
        if (this.showAll) {
            this.showAll.setAttribute('aria-expanded', 'false');
        }
        if (this.menuOpen) {
            this.hide(this.list);
            this.menuOpen = false;
            this.triggerOptionCallback('onClose', [this.list]);
        }
    }

    /**
     * enable autocomplete (e.g. when under maxItems selected)
     */
    enable() {
        if (this.disabled) {
            this.disabled = false;
            this.input.disabled = false;
            const cssNameSpace = this.cssNameSpace;
            removeClass(this.input, `${cssNameSpace}__input--disabled disabled`);
            removeClass(this.wrapper, `${cssNameSpace}__wrapper--disabled disabled`);
            if (this.showAll) {
                this.showAll.setAttribute('tabindex', '0');
                removeClass(this.showAll, `${cssNameSpace}__show-all--disabled disabled`);
            }
        }
        this.enableDeletions();
    }

    /**
     * disable autocomplete (e.g. when maxItems selected)
     */
    disable(disableDeletions: boolean = false) {
        if (!this.disabled) {
            this.disabled = true;
            this.input.disabled = true;
            const cssNameSpace = this.cssNameSpace;
            addClass(this.input, `${cssNameSpace}__input--disabled disabled`);
            addClass(this.wrapper, `${cssNameSpace}__wrapper--disabled disabled`);
            if (this.showAll) {
                this.showAll.setAttribute('tabindex', '-1');
                addClass(this.showAll, `${cssNameSpace}__show-all--disabled disabled`);
            }
        }
        if (disableDeletions) {
            this.disableDeletions();
        }
    }

    /**
     * (re-)enable ability to delete multi-select items
     */
    enableDeletions() {
        if (!this.deletionsDisabled) {
            return;
        }
        this.deletionsDisabled = false;
        removeClass(this.wrapper, `${this.cssNameSpace}__wrapper--deletions-disabled`);
        this.getSelectedElems().forEach((element: HTMLElement) => {
            removeClass(element, `${this.cssNameSpace}__selected--disabled`);
            element.setAttribute('tabindex', '0');
        });
    }

    /**
     * disable ability to delete multi-select items
     */
    disableDeletions() {
        if (this.deletionsDisabled) {
            return;
        }
        this.deletionsDisabled = true;
        addClass(this.wrapper, `${this.cssNameSpace}__wrapper--deletions-disabled`);
        this.getSelectedElems().forEach((element: HTMLElement) => {
            addClass(element, `${this.cssNameSpace}__selected--disabled`);
            element.setAttribute('tabindex', '-1');
        });
    }

    /**
     * if in autoGrow mode, trigger an input size re-calc
     */
    triggerAutoGrow() {
        if (this.autoGrow && this.inputAutoWidth && typeof this.inputAutoWidth.trigger === 'function') {
            this.inputAutoWidth.trigger();
        }
    }

    /**
     * set input value to specific string, and related component vars
     */
    setInputValue(value?: string, setPollingValue: boolean = false) {
        this.input.value = this.term = value;
        if (setPollingValue) {
            this.inputPollingValue = value;
        }
        this.triggerAutoGrow();
    }

    /**
     * check if value (or current input value) is contained in a selection of options;
     * checks for exact string match
     */
    indexOfValueIn(options: any[], value: string = this.input.value, propToCheck: string = 'label'): number {
        if (options.length && (value = trimString(value).toLowerCase())) {
            for (let i = 0, l = options.length; i < l; i += 1) {
                if (trimString(options[i][propToCheck]).toLowerCase() === value) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * make a screen reader announcement
     */
    announce(text: string, delay: number = 400) {
        if (!this.srAnnouncements || !text || typeof text !== 'string') {
            return;
        }
        // in immediate case, do not use timer
        if (delay === 0) {
            this.srAnnouncements.textContent = text;

            this.emptyAnnouncement();
            return;
        }

        clearTimeout(this.announcementTimer);
        this.announcementTimer = setTimeout(() => {
            this.srAnnouncements.textContent = text;

            this.emptyAnnouncement();
        }, delay);
    }

    /**
     * empty the screen reader announcement
     */
    emptyAnnouncement(delay: number = 2000) {
        if (!this.srAnnouncements) {
            return;
        }
        // in immediate case, do not use timer
        if (delay === 0) {
            this.srAnnouncements.textContent = '';
            return;
        }

        clearTimeout(this.announcementEmptyTimer);
        this.announcementEmptyTimer = setTimeout(() => {
            this.srAnnouncements.textContent = '';
        }, delay);
    }

    /**
     * check if element is a selected element in the DOM
     */
    isSelectedElem(element: Element): boolean {
        const sourceEntry = element && element[SELECTED_OPTION_PROP];
        return this.multiple && sourceEntry && typeof sourceEntry === 'object';
    }

    /**
     * get selected items DOM elements
     */
    getSelectedElems(): HTMLElement[] {
        const result = [];
        for (let i = 0, l = this.wrapper.childNodes.length; i < l; i += 1) {
            const node: ChildNode = this.wrapper.childNodes[i];
            if (node.nodeType === 1 && this.isSelectedElem(node as HTMLElement)) {
                result.push(node as HTMLElement);
            }
        }
        return result;
    }

    /**
     * remove object from selected options array
     */
    removeEntryFromSelected(entry: any) {
        // prevent removing if deletions are disabled
        if (this.deletionsDisabled) {
            return;
        }

        // check for explicit match first
        let index: number = this.selected.indexOf(entry);
        // if object reference check did not work found, do a manual value check
        if (index === -1) {
            for (let i = 0, l = this.selected.length; i < l; i += 1) {
                if (this.selected[i].value === entry.value) {
                    index = i;
                    break;
                }
            }
        }
        if (index > -1 && this.selected[index]) {
            const option: any = mergeObjects(this.selected[index]);
            const label = option.label;
            // set option or checkbox to not be selected
            setElementState(option.element, false, this);
            // update array
            this.selected.splice(index, 1);
            // fire on delete before updating the DOM
            this.triggerOptionCallback('onDelete', [option]);
            // update original element values based on now selected items
            this.setSourceElementValues();
            // re-build the selected items markup
            this.buildMultiSelected();
            // update input size in autoGrow mode
            this.triggerAutoGrow();
            // make sure to announce deletion to screen reader users
            this.announce(`${label} ${this.options.srDeletedText}`, 0);
            // return focus to input
            this.input.focus();
        }
    }

    /**
     * create a DOM element for entry in selected array
     */
    createSelectedElemFrom(entry: any): HTMLSpanElement {
        const label = entry.label;
        const span = document.createElement('span');
        span.setAttribute('aria-label', `${this.options.srDeleteText} ${label}`);
        span.setAttribute('class', `${this.cssNameSpace}__selected`);
        span.setAttribute('role', 'button');
        span.setAttribute('tabindex', '0');
        span[SELECTED_OPTION_PROP] = entry;
        span.textContent = label;
        return span;
    }

    /**
     * re-build the html showing the selected items
     * note: there are a lot of loops here - could affect performance
     */
    buildMultiSelected() {
        // only do anything in multiple mode
        if (!this.multiple) {
            return;
        }

        // disable or enable as needed
        if (this.multiple && this.selected.length >= this.options.maxItems) {
            this.disable();
        } else {
            this.enable();
        }

        // no elements, and none selected, do nothing
        const currentSelectedDomElems = this.getSelectedElems();
        if (!this.selected.length && !currentSelectedDomElems.length) {
            return;
        }

        // cycle through existing DOM elements, and remove any not in the selected array
        // build up a new array of elements
        const updatedSelectedDomElems: HTMLElement[] = [];
        currentSelectedDomElems.forEach((element: HTMLElement) => {
            const sourceEntry: any = element[SELECTED_OPTION_PROP];
            // check current dom element against selected array
            for (let i = 0, l = this.selected.length; i < l; i += 1) {
                const selected = this.selected[i];
                // if match found, push to new array
                if (selected === sourceEntry || selected.value === sourceEntry.value) {
                    updatedSelectedDomElems.push(element);
                    return;
                }
            }
            // if no match was found, remove from the dom
            this.wrapper.removeChild(element);
        });

        // cycle through selected array, and add elements for each to the DOM
        const fragment = document.createDocumentFragment();
        this.selected.forEach((selected: any) => {
            // check if there is an element in the DOM for it already
            // note: assumes all entries have unique values, but could be an issue
            // if source is driven by multiple different checkbox groups
            for (let i = 0, l = updatedSelectedDomElems.length; i < l; i += 1) {
                const sourceEntry: any = updatedSelectedDomElems[i][SELECTED_OPTION_PROP];
                if (sourceEntry === selected || sourceEntry.value === selected.value) {
                    return;
                }
            }
            // if there wasn't, add one
            fragment.appendChild(this.createSelectedElemFrom(selected));
        });

        // insert new elements
        // can't check against fragment.children or fragment.childElementCount, as does not work in IE
        if (fragment.childNodes && fragment.childNodes.length) {
            this.wrapper.insertBefore(fragment, this.list);
        }

        // set ids on selected DOM elements
        const ids: string[] = this.getSelectedElems().map((element: HTMLElement, index: number) => {
            const id = `${this.ids.OPTION_SELECTED}-${index}`;
            element.setAttribute('id', id);
            return id;
        });
        ids.push(this.ids.LIST);

        // indicate to screen readers that the input owns selected elements, and the list
        this.input.setAttribute('aria-owns', ids.join(' '));

        // in autoGrow mode, hide the placeholder if there are selected items
        if (this.autoGrow && this.selected.length) {
            this.input.removeAttribute('placeholder');
        } else if (this.options.placeholder) {
            this.input.setAttribute('placeholder', this.options.placeholder);
        }
    }

    /**
     * set the aria-describedby attribute on the input
     */
    setInputDescription() {
        const exists = this.input.getAttribute('aria-describedby');
        const current = trimString(exists);
        let describedBy = current.replace(this.ids.SR_ASSISTANCE, '');

        if (!this.input.value.length) {
            describedBy = `${describedBy} ${this.ids.SR_ASSISTANCE}`;
        }

        // set or remove attribute, but only if necessary
        if ((describedBy = trimString(describedBy))) {
            if (describedBy !== current) {
                this.input.setAttribute('aria-describedby', describedBy);
            }
        } else if (exists) {
            this.input.removeAttribute('aria-describedby');
        }
    }

    /**
     * reset classes and aria-selected attribute for all visible filtered options
     */
    resetOptionAttributes(options: HTMLElement[] = getChildrenOf(this.list)) {
        const classToRemove = `${this.cssNameSpace}__option--focused focused focus`;
        options.forEach((option: HTMLElement) => {
            option.setAttribute('aria-selected', 'false');
            removeClass(option, classToRemove);
        });
    }

    /**
     * move focus to correct option, or to input (on up and down arrows)
     */
    setOptionFocus(event: Event, index: number) {
        const options: HTMLElement[] = getChildrenOf(this.list);
        // set aria-selected to false and remove focused class
        this.resetOptionAttributes(options);

        // if negative index, or no options available, focus on input
        if (index < 0 || !options.length) {
            this.currentSelectedIndex = -1;
            // focus on input, only if event was from another element
            if (event && event.target !== this.input) {
                this.input.focus();
            }
            return;
        }

        // down arrow on/past last option, focus on last item
        if (index >= options.length) {
            this.currentSelectedIndex = options.length - 1;
            this.setOptionFocus(event, this.currentSelectedIndex);
            return;
        }

        // if option found, move focus to it...
        const toFocus = options[index];
        if (toFocus && typeof toFocus.getAttribute('tabindex') === 'string') {
            this.currentSelectedIndex = index;
            addClass(toFocus, `${this.cssNameSpace}__option--focused focused focus`);
            toFocus.setAttribute('aria-selected', 'true');
            toFocus.focus();
            return;
        }

        // reset index just in case none of the above conditions are met
        this.currentSelectedIndex = -1;
    }

    /**
     * set values and dispatch events based on any DOM elements in the selected array
     */
    setSourceElementValues() {
        const valToSet: string[] = [];
        for (let i = 0, l = this.selected.length; i < l; i += 1) {
            const entry = this.selected[i];
            valToSet.push(entry.value);
            setElementState(entry.element, true, this); // element processing
        }

        // set original input value
        if (this.elementIsInput) {
            const valToSetString = valToSet.join(this.options.multipleSeparator);
            // only set and trigger change if value will be different
            if (valToSetString !== (this.element as HTMLInputElement).value) {
                (this.element as HTMLInputElement).value = valToSetString;
                dispatchEvent(this.element, 'change');
            }
        }

        // included in case of multi-select mode used with a <select> element as the source
        if (!this.selected.length && this.elementIsSelect) {
            (this.element as HTMLSelectElement).value = '';
        }

        this.triggerOptionCallback('onChange', [this.selected]);
    }

    /**
     * select option from the list by index
     */
    handleOptionSelect(event: any, index: number, focusInputAfterSelection: boolean = true) {
        // defensive check for proper index, that the filteredSource exists, and not exceed max items option
        if (
            typeof index !== 'number' ||
            index < 0 ||
            (this.multiple && this.selected.length >= this.options.maxItems) ||
            !this.filteredSource.length ||
            !this.filteredSource[index]
        ) {
            return;
        }

        // generate new object from the selected item in case the original source gets altered
        const option: any = mergeObjects(this.filteredSource[index]);

        // detect if selected option is already in selected array
        let alreadySelected: boolean = false;
        for (let i = 0, l = this.selected.length; i < l; i += 1) {
            if (this.selected[i].value === option.value) {
                alreadySelected = true;
                break;
            }
        }

        // reset selected array in single select mode
        // use splice so that selected Array in API is also correctly updated
        if (!alreadySelected && !this.multiple) {
            this.selected.splice(0);
        }

        // (re)set values of any DOM elements based on selected array
        if (!alreadySelected) {
            this.selected.push(option);
            this.setSourceElementValues();
            // rebuild multi-selected if needed
            this.buildMultiSelected();
        }

        // update the visible input - empty it if in multiple mode
        // do this after multiSelected elements are built,
        // in case placeholder is affected in autoGrow mode
        this.setInputValue(this.multiple ? '' : option.label, true);

        // trigger callback and announce selection to screen reader users
        this.triggerOptionCallback('onConfirm', [option]);
        this.announce(`${option.label} ${this.options.srSelectedText}`, 0);

        // return focus to input
        if (!this.disabled && focusInputAfterSelection !== false) {
            this.input.focus();
        }

        // close menu after option selection, and after returning focus to input
        this.hide();
    }

    /**
     * remove selected entries from list results if in multiple mode
     */
    removeSelectedFromResults(results: any[]): any[] {
        if (!this.multiple || !this.selected.length) {
            return results;
        }
        const toReturn = [];
        results.forEach((entry: any) => {
            const selected: any[] = this.selected;
            for (let i = 0, l = selected.length; i < l; i += 1) {
                // check for label and value match
                if (entry.label === selected[i].label && entry.value === selected[i].value) {
                    return;
                }
            }
            toReturn.push(entry);
        });
        return toReturn;
    }

    /**
     * final filtering and render for list options
     */
    setListOptions(results: any[]) {
        const toShow: string[] = [];
        // now commit to setting the filtered source
        const mapping: any = this.options.sourceMapping;
        // if in multiple mode, exclude items already in the selected array
        const updated: any[] = this.removeSelectedFromResults(results);
        // allow callback to alter the response before rendering
        const callback: any = this.triggerOptionCallback('onResponse', updated);
        this.filteredSource = callback ? processSourceArray(callback, mapping) : updated;

        // build up the list html
        const optionId: string = this.ids.OPTION;
        const cssNameSpace: string = this.cssNameSpace;
        const optionClassName: string = `${cssNameSpace}__option`;
        const length: number = this.filteredSource.length;
        const checkCallback: boolean = typeof this.options.onItemRender === 'function';
        const maxResults: number = this.forceShowAll ? 9999 : this.options.maxResults;
        const lengthToUse: number = maxResults < length ? maxResults : length;

        for (let i = 0; i < lengthToUse; i += 1) {
            const thisSource: any = this.filteredSource[i];
            const callbackResponse = checkCallback && this.triggerOptionCallback('onItemRender', [thisSource]);
            const itemContent = callbackResponse || thisSource.label;
            toShow.push(
                `<li tabindex="-1" aria-selected="false" role="option" class="${optionClassName}" ` +
                    `id="${optionId}--${i}" aria-posinset="${i + 1}" ` +
                    `aria-setsize="${lengthToUse}">${itemContent}</li>`
            );
        }

        // set has-results or no-results class on the list element
        if (toShow.length) {
            addClass(this.list, `${cssNameSpace}__list--has-results`);
            removeClass(this.list, `${cssNameSpace}__list--no-results`);
        } else {
            removeClass(this.list, `${cssNameSpace}__list--has-results`);
            addClass(this.list, `${cssNameSpace}__list--no-results`);
        }

        // no results text handling
        let announce: string;
        const noText: string = this.options.noResultsText;
        if (!toShow.length && typeof noText === 'string' && noText.length) {
            announce = noText;
            toShow.push(`<li class="${optionClassName} ${optionClassName}--no-results">${noText}</li>`);
        }

        // remove loading class(es) and reset variables
        this.cancelFilterPrep();

        // announce to screen reader
        if (!announce) {
            announce = this.triggerOptionCallback('srResultsText', [lengthToUse]);
        }
        this.announce(announce);

        // render the list, only if we have to
        // time taken for string comparison is worth it to not have to re-parse and re-render the list
        const newListHtml: string = toShow.join('');
        if (this.currentListHtml !== newListHtml) {
            this.currentListHtml = newListHtml;
            // innerHTML vs insertAdjacentHtml performance in old IE ?
            this.list.innerHTML = newListHtml;
        } else {
            // if list html matches, and not re-rendered, clear aria-selected and focus classes
            this.resetOptionAttributes();
        }

        // if toShow array is empty, make sure not to render the menu
        if (!toShow.length) {
            this.hide();
            this.forceShowAll = false;
            return;
        }

        this.show();
        // reset forceShowAll must be after .show()
        // aria-expanded attribute on showAllControl is set in .show() method
        this.forceShowAll = false;
    }

    /**
     * trigger async call for options to render
     */
    handleAsync(value: string, isFirstCall: boolean = false) {
        // abort any current call first
        if (this.xhr && typeof this.xhr.abort === 'function') {
            this.xhr.abort();
        }

        const xhr: XMLHttpRequest = new XMLHttpRequest();
        const isShowAll: boolean = this.forceShowAll;
        const context = isFirstCall ? null : this.api;
        const baseAmount = this.multiple ? this.selected.length : 0;
        const unlimited = isShowAll || isFirstCall || this.options.maxResults === 9999;
        let url =
            this.source +
            (/\?/.test(this.source as string) ? '&' : '?') +
            `${encodeURIComponent(this.options.asyncQueryParam)}=${encodeURIComponent(value)}&` +
            `${encodeURIComponent(this.options.asyncMaxResultsParam)}=` +
            `${unlimited ? 9999 : baseAmount + this.options.maxResults}`;
        url = this.triggerOptionCallback('onAsyncPrep', [url], context) || url;

        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.readyState !== xhr.DONE) {
                return;
            }
            if (xhr.status >= 200 && xhr.status < 300) {
                // return forceShowAll to previous state before the options render
                this.forceShowAll = isShowAll;
                const callbackResponse = this.triggerOptionCallback('onAsyncSuccess', [value, xhr], context);
                const source = callbackResponse || xhr.responseText;
                const items: any[] = processSourceArray(source, this.options.sourceMapping, false);

                if (isFirstCall) {
                    this.prepSelectedFromArray(items);
                    this.setInputStartingStates(false);
                } else {
                    this.setListOptions(items);
                }
            }
        };
        xhr.onerror = () => {
            this.triggerOptionCallback('onAsyncError', [value, xhr], context);
        };

        // allow the creation of an uncancellable call to use on first load
        if (!isFirstCall) {
            this.xhr = xhr;
        }

        // before send option callback, to allow adjustments to the xhr object,
        // e.g. adding auth headers
        this.triggerOptionCallback('onAsyncBeforeSend', [xhr], context);
        xhr.send();
    }

    /**
     * trigger filtering using a value
     */
    filter(value: string) {
        // fail silently if no value is provided
        if (typeof value !== 'string') {
            this.cancelFilterPrep();
            return;
        }

        // allow onSearch callback to affect the search value
        // only permitted when not a forceShowAll case
        let forceShowAll: boolean = this.forceShowAll;
        if (!forceShowAll) {
            const callbackResponse: string = this.triggerOptionCallback('onSearch', [value]);
            if (typeof callbackResponse === 'string') {
                value = callbackResponse;
            }
        }

        // store search term - used for comparison in filterPrep
        this.term = value;

        // async handling
        if (typeof this.source === 'string' && this.source.length) {
            this.handleAsync(value);
            // set show all to false immediately as may be used in other places
            this.forceShowAll = false;
            return;
        }

        // handle the source as a function
        if (typeof this.source === 'function') {
            // provide a render function to use as a callback
            const render: (toRender: any[]) => void = (toRender) => {
                const result: any[] = processSourceArray(toRender, this.options.sourceMapping);
                this.setListOptions(result);
            };
            // check for `then` function on the result to allow use of a promise
            const result = this.source.call(this.api, this.term, render);
            if (result && typeof result.then === 'function') {
                result.then((toRender: any[]) => render(toRender));
            }
            return;
        }

        // if empty string, show all
        if (!value) {
            forceShowAll = true;
        }

        // build up results from static list
        const toReturn: any[] = [];
        if (this.source && this.source.length) {
            // build up array of source entry props to search in
            let toCheck: string[] = [CLEANED_LABEL_PROP];
            if (!forceShowAll) {
                value = cleanString(value, true);
                const searchIn: string[] = this.options.alsoSearchIn;
                if (Array.isArray(searchIn) && searchIn.length) {
                    toCheck = prepSearchInArray(toCheck.concat(searchIn));
                }
            }
            // include everything in forceShowAll case
            (this.source as any[]).forEach((entry: any) => {
                if (forceShowAll || searchSourceEntryFor(entry, value, toCheck)) {
                    toReturn.push(entry);
                }
            });
        }

        // now render!
        this.setListOptions(toReturn);
    }

    /**
     * cancel filter timer and remove loading classes
     */
    cancelFilterPrep() {
        clearTimeout(this.filterTimer);
        removeClass(this.wrapper, `${this.cssNameSpace}__wrapper--loading loading`);
        removeClass(this.input, `${this.cssNameSpace}__input--loading loading`);
        this.filtering = false;
    }

    /**
     * prepare to run filter - pre checks, and timer
     */
    filterPrep(event: any, doValueOverrideCheck: boolean = false, runNow: boolean = false) {
        const forceShowAll: boolean = this.forceShowAll;
        const delay: number = forceShowAll || runNow ? 0 : this.options.delay;

        // clear timers and set internal state
        this.cancelFilterPrep();
        this.filtering = true;

        this.filterTimer = setTimeout(() => {
            let value: string = this.input.value;

            // set polling value, even if search criteria are not met
            this.inputPollingValue = value;

            // treat as empty search if:
            // forceShowAll, or in single mode and selected item label matches current value
            if (
                forceShowAll ||
                value === '' ||
                (doValueOverrideCheck &&
                    !this.multiple &&
                    this.selected.length &&
                    trimString(this.selected[0].label) === trimString(value))
            ) {
                value = '';
            }

            // handle aria-describedby
            this.setInputDescription();

            // length check
            if (!forceShowAll && value.length < this.options.minLength) {
                this.hide();
                return;
            }

            // try catch used due to permissions issues in some cases
            let modifier: boolean;
            try {
                const keyEvent: KeyboardEvent = event as KeyboardEvent;
                const isKeydown: boolean = event && event.type === 'keydown';
                // allow shift key, just in case...
                modifier = isKeydown && (keyEvent.altKey || keyEvent.ctrlKey || keyEvent.metaKey);
            } catch (e) {}

            // prevent search being run again with the same value
            const equalVals: boolean = value === '' ? false : value === this.term;
            if (!equalVals || (equalVals && !this.menuOpen && !modifier)) {
                addClass(this.wrapper, `${this.cssNameSpace}__wrapper--loading loading`);
                addClass(this.input, `${this.cssNameSpace}__input--loading loading`);
                this.currentSelectedIndex = -1;
                this.filter(value);
            } else {
                // if search wasn't run, make sure to clear internal state,
                // otherwise it will block the down key from moving to the options;
                // thanks to /u/holloway on reddit for discovering this
                this.cancelFilterPrep();
            }
        }, delay);
    }

    /**
     * trigger filter prep in showAll mode
     */
    filterPrepShowAll(event: Event) {
        if (this.disabled) {
            return;
        }
        // need to use a timer so that this is triggered after the wrapper focusout
        clearTimeout(this.showAllPrepTimer);
        this.showAllPrepTimer = setTimeout(() => {
            if (this.componentBlurTimer) {
                clearTimeout(this.componentBlurTimer);
            }
            event.preventDefault();
            this.forceShowAll = true;
            this.filterPrep(event, false, true);
        }, 0);
    }

    /**
     * blur behaviour for hiding list and removing focus class(es)
     * forced when using escape key
     */
    handleComponentBlur(event: Event, force: boolean = false) {
        clearTimeout(this.componentBlurTimer);
        // use a timeout to ensure this blur fires after other focus events
        // and in case the user focuses back in immediately
        const delay: number = force ? 0 : 100;
        this.componentBlurTimer = setTimeout(() => {
            // do nothing if blurring to an element within the list
            const activeElem: Element = document.activeElement;
            if (
                !force &&
                activeElem &&
                !(this.showAll && this.showAll === activeElem) && // exception for show all button
                !this.isSelectedElem(activeElem) && // exception for selected items
                // must base this on the wrapper to allow scrolling the list in IE
                this.wrapper.contains(activeElem)
            ) {
                return;
            }

            // cancel any running async call
            if (this.xhr && typeof this.xhr.abort === 'function') {
                this.xhr.abort();
            }

            // confirmOnBlur behaviour
            if (!force && this.options.confirmOnBlur && this.menuOpen) {
                // if blurring from an option (currentSelectedIndex > -1), select it
                let toUse: number = this.currentSelectedIndex;
                if (typeof toUse !== 'number' || toUse === -1) {
                    // otherwise check for exact match between current input value and available items
                    toUse = this.indexOfValueIn.call(this, this.filteredSource);
                }
                this.handleOptionSelect({}, toUse, false);
            }

            // cancel timers and hide menu
            this.cancelFilterPrep();
            this.hide();

            // in single select case, if current value and chosen value differ, clear selected and input value
            if (!this.multiple && this.indexOfValueIn.call(this, this.selected) === -1) {
                if (this.selected.length) {
                    this.removeEntryFromSelected(this.selected[0]);
                }
                const inputOrDdl: boolean = this.elementIsInput || this.elementIsSelect;
                const originalElement = this.element as HTMLInputElement | HTMLSelectElement;

                // Clear selected and input value ?
                if(this.options.keepUserInput) {
                    // set original input value
                    if (this.elementIsInput && this.input.value !== '') {
                        originalElement.value = this.input.value;
                        dispatchEvent(originalElement, 'change');
                    }
                } else {
                    if (inputOrDdl && originalElement.value !== '') {
                        originalElement.value = '';
                        dispatchEvent(originalElement, 'change');
                    }
                    this.setInputValue('', true);
                }
            }

            // always clear input value in multiple mode
            if (this.multiple) {
                this.setInputValue('', true);
            }

            // unbind document click
            if (this.documentClickBound) {
                this.documentClickBound = false;
                document.removeEventListener('click', this.documentClick);
            }

            this.triggerOptionCallback('onBlur', [this.wrapper]);
            this.isFocused = false;
        }, delay);
    }

    /**
     * up arrow usage within the component; for option focus, or return focus to input
     */
    handleUpKey(event: KeyboardEvent) {
        event.preventDefault();
        if (!this.disabled && this.menuOpen && typeof this.currentSelectedIndex === 'number') {
            this.setOptionFocus(event, this.currentSelectedIndex - 1);
        }
    }

    /**
     * down arrow usage within the component; for option focus, or showAll
     */
    handleDownKey(event: KeyboardEvent) {
        event.preventDefault();
        // if closed, and text is long enough, run search
        if (!this.menuOpen) {
            this.forceShowAll = this.options.minLength < 1;
            if (this.forceShowAll || this.input.value.length >= this.options.minLength) {
                this.filterPrep(event);
            }
        }
        // if menu is open and a search is not running, move focus to downward option
        if (this.menuOpen && !this.filtering) {
            const current: number = this.currentSelectedIndex;
            if (typeof current !== 'number' || current < 0) {
                this.setOptionFocus(event, 0);
            } else {
                this.setOptionFocus(event, current + 1);
            }
        }
    }

    /**
     * end key handling within the component; move focus to last option
     */
    handleEndKey(event: KeyboardEvent) {
        if (!this.disabled && this.menuOpen && event.target !== this.input) {
            const options = getChildrenOf(this.list);
            if (options.length) {
                event.preventDefault();
                this.setOptionFocus(event, options.length - 1);
            }
        }
    }

    /**
     * home key handling within the component; move focus to first option
     */
    handleHomeKey(event: KeyboardEvent) {
        if (!this.disabled && this.menuOpen && event.target !== this.input) {
            event.preventDefault();
            this.setOptionFocus(event, 0);
        }
    }

    /**
     * enter keydown anywhere within the component
     */
    handleEnterKey(event: KeyboardEvent) {
        const target: HTMLElement = event.target as HTMLElement;
        // if in multiple mode, and event target was a selected item, remove it;
        // this needs to be possible even when the autocomplete is disabled
        if (this.isSelectedElem(target)) {
            this.removeEntryFromSelected(target[SELECTED_OPTION_PROP]);
            return;
        }

        if (this.disabled) {
            return;
        }

        if (this.showAll && target === this.showAll) {
            this.filterPrepShowAll(event);
            return;
        }

        if (this.menuOpen) {
            event.preventDefault();
            if (this.currentSelectedIndex > -1) {
                this.handleOptionSelect(event, this.currentSelectedIndex);
            }
        }

        // if enter keypress was from the filter input, trigger search immediately
        if (target === this.input) {
            this.filterPrep(event, false, true);
        }
    }

    /**
     * all other keydown handling within the component;
     * enter, up, down, home, end, and escape handled elsewhere
     */
    handleKeyDownDefault(event: KeyboardEvent) {
        const keycode: number = event.keyCode;
        const targetIsInput: boolean = event.target === this.input;
        // on space, if focus state is on any other item than the input, treat as enter;
        // on delete on a selected elem, treat as enter to delete it
        if (
            (keycode === KEYCODES.SPACE && !targetIsInput) ||
            (this.isSelectedElem(event.target as HTMLElement) && keycode === KEYCODES.DELETE)
        ) {
            event.preventDefault();
            this.handleEnterKey(event);
            return;
        }

        if (this.disabled) {
            return;
        }

        // on backspace, if using empty input in multiple mode, delete last selected entry
        const selectedLength: number = this.selected && this.selected.length;
        if (
            this.options.deleteOnBackspace &&
            keycode === KEYCODES.BACKSPACE &&
            this.input.value === '' &&
            selectedLength &&
            targetIsInput &&
            this.multiple
        ) {
            this.removeEntryFromSelected(this.selected[selectedLength - 1]);
            return;
        }

        // any printable character not on input, return focus to input
        const printableKey: boolean = isPrintableKey(keycode);
        const focusInput: boolean = !targetIsInput && printableKey;
        if (focusInput) {
            this.input.focus();
        }

        // trigger filtering - done here, instead of using input event, due to IE9 issues
        if (focusInput || (targetIsInput && printableKey)) {
            this.filterPrep(event);
        }
    }

    /**
     * component keydown handling
     */
    prepKeyDown(event: KeyboardEvent) {
        switch (event.keyCode) {
            case KEYCODES.UP:
                this.handleUpKey(event);
                break;
            case KEYCODES.DOWN:
                this.handleDownKey(event);
                break;
            case KEYCODES.END:
                this.handleEndKey(event);
                break;
            case KEYCODES.HOME:
                this.handleHomeKey(event);
                break;
            case KEYCODES.ENTER:
                this.handleEnterKey(event);
                break;
            case KEYCODES.ESCAPE:
                this.handleComponentBlur(event, true);
                break;
            default:
                this.handleKeyDownDefault(event);
                break;
        }
    }

    /**
     * cancel checking for input value changes from external causes
     */
    cancelPolling() {
        clearTimeout(this.pollingTimer);
    }

    /**
     * start checking for input value changes from causes that bypass event detection;
     * e.g. dictation software
     */
    startPolling() {
        // check if input value does not equal last searched term
        if (!this.filtering && this.input.value !== this.inputPollingValue) {
            this.filterPrep({});
        }
        this.pollingTimer = setTimeout(() => {
            this.startPolling();
        }, 200);
    }

    /**
     * bind component event listeners to generated elements
     */
    bindEvents() {
        // when focus is moved outside of the component, close everything
        this.wrapper.addEventListener('focusout', (event) => {
            this.handleComponentBlur(event, false);
        });
        // reset selected index
        this.wrapper.addEventListener('focusin', (event) => {
            if (!this.list.contains(event.target as Element)) {
                this.currentSelectedIndex = -1;
            }
            if (!this.isFocused) {
                this.triggerOptionCallback('onFocus', [this.wrapper]);
            }
            this.isFocused = true;
        });
        // handle all keydown events inside the component
        this.wrapper.addEventListener('keydown', (event) => {
            this.prepKeyDown(event);
        });
        // if clicking directly on the wrapper, move focus to the input
        this.wrapper.addEventListener('click', (event) => {
            if (event.target === this.wrapper) {
                this.input.focus();
                return;
            }
            if (this.isSelectedElem(event.target as Element)) {
                this.removeEntryFromSelected(event.target[SELECTED_OPTION_PROP]);
            }
        });

        const wrapperFocusClasses: string = `${this.cssNameSpace}__wrapper--focused focused focus`;
        const inputFocusClasses: string = `${this.cssNameSpace}__input--focused focused focus`;
        // when blurring out of input, remove classes
        this.input.addEventListener('blur', () => {
            removeClass(this.wrapper, wrapperFocusClasses);
            removeClass(this.input, inputFocusClasses);
            this.cancelPolling();
        });
        // trigger filter on input event as well as keydown (covering bases)
        this.input.addEventListener('input', (event) => {
            if (document.activeElement === this.input) {
                this.filterPrep(event);
            }
        });
        // when specifically clicking on input, if menu is closed, and value is long enough, search
        this.input.addEventListener('click', (event) => {
            if (!this.menuOpen && this.input.value.length >= this.options.minLength) {
                this.filterPrep(event, true);
            }
        });
        // when focusing on input, reset selected index and trigger search handling
        this.input.addEventListener('focusin', (event) => {
            addClass(this.wrapper, wrapperFocusClasses);
            addClass(this.input, inputFocusClasses);
            this.startPolling();
            if (!this.disabled && !this.menuOpen) {
                this.filterPrep(event, true);
            }
        });

        // show all button click
        if (this.showAll) {
            this.showAll.addEventListener('click', (event) => {
                this.filterPrepShowAll(event);
            });
        }

        // clear any current focus position when hovering into the list
        this.list.addEventListener('mouseenter', (event) => {
            this.resetOptionAttributes();
        });
        // trigger options selection
        this.list.addEventListener('click', (event) => {
            if (event.target !== this.list) {
                const options = getChildrenOf(this.list);
                if (options.length) {
                    const optionIndex = options.indexOf(event.target as HTMLElement);
                    this.handleOptionSelect(event, optionIndex);
                }
            }
        });

        // setup input autoGrow behaviour
        if (this.autoGrow) {
            this.inputAutoWidth = new InputAutoWidth(this.input);
        }
    }

    /**
     * set starting source array based on child checkboxes
     */
    prepListSourceCheckboxes() {
        this.multiple = true; // force multiple in this case
        // reset source and use checkboxes
        this.source = [];
        const elements: NodeListOf<HTMLInputElement> = this.element.querySelectorAll('input[type="checkbox"]');
        for (let i = 0, l = elements.length; i < l; i += 1) {
            const checkbox: HTMLInputElement = elements[i];
            // must have a value other than empty string
            if (!checkbox.value) {
                continue;
            }
            const toPush: any = { element: checkbox, value: checkbox.value };
            // label searching
            let checkboxLabelElem: HTMLElement = checkbox.closest('label');
            if (!checkboxLabelElem && checkbox.id) {
                checkboxLabelElem = document.querySelector('[for="' + checkbox.id + '"]');
            }
            if (checkboxLabelElem) {
                toPush.label = checkboxLabelElem.textContent;
            }
            // if no label so far, re-use value
            if (!toPush.label) {
                toPush.label = toPush.value;
            }
            toPush[CLEANED_LABEL_PROP] = cleanString(toPush.label);
            this.source.push(toPush);
            // add to selected if applicable
            if (checkbox.checked) {
                this.selected.push(toPush);
            }
        }
    }

    /**
     * set starting source array based on <select> options
     */
    prepListSourceDdl() {
        const elementIsMultiple = (this.element as HTMLSelectElement).multiple;
        // force multiple if select handles multiple
        if (elementIsMultiple && !this.multiple) {
            this.multiple = true;
        }
        // if options set to multiple mode, but select does not support it, limit selections to 1
        if (!elementIsMultiple && this.multiple && this.options.maxItems > 1) {
            this.options.maxItems = 1;
        }

        // reset source and use options
        this.source = [];
        const options: NodeListOf<HTMLOptionElement> = this.element.querySelectorAll('option');
        for (let i = 0, l = options.length; i < l; i += 1) {
            const option: HTMLOptionElement = options[i];
            // must have a value other than empty string
            if (!option.value) {
                continue;
            }
            const toPush: any = {
                element: option,
                value: option.value,
                label: option.textContent,
            };
            toPush[CLEANED_LABEL_PROP] = cleanString(toPush.label);
            this.source.push(toPush);
            // add to selected if applicable
            if (option.selected) {
                this.selected.push(toPush);
            }
        }
    }

    /**
     * build up selected array if starting element was an input, and had a value
     */
    prepSelectedFromArray(source: any[]) {
        const value = this.elementIsInput && (this.element as HTMLInputElement).value;
        if (value && source && source.length) {
            // account for multiple mode
            const multiple: boolean = this.options.multiple;
            const separator: string = this.options.multipleSeparator;
            const valueArr: string[] = multiple ? value.split(separator) : [value];

            valueArr.forEach((val: string) => {
                // make sure it is not already in the selected array
                // but is in the source array (check via 'value', not 'label')
                if (this.indexOfValueIn(this.selected, val, 'value') === -1) {
                    const indexInSource = this.indexOfValueIn(source, val, 'value');
                    if (indexInSource > -1) {
                        this.selected.push(source[indexInSource]);
                    }
                }
            });
        }
    }

    /**
     * adjust starting source array to format needed, and set selected
     */
    prepListSourceArray() {
        this.source = processSourceArray(this.source as any[], this.options.sourceMapping);
        this.prepSelectedFromArray(this.source);
    }

    /**
     * trigger source string endpoint to generate selected array
     */
    prepListSourceAsync() {
        const originalElement: HTMLInputElement = this.element as HTMLInputElement;
        if (this.elementIsInput && originalElement.value) {
            this.handleAsync(originalElement.value, true);
        }
    }

    /**
     * process source function to generate selected array
     */
    prepListSourceFunction() {
        const originalElement: HTMLInputElement = this.element as HTMLInputElement;
        if (!this.elementIsInput || !originalElement.value) {
            return;
        }

        const render: (response: any[]) => void = (response) => {
            const processedSource = processSourceArray(response, this.options.sourceMapping);
            this.prepSelectedFromArray(processedSource);
            this.setInputStartingStates(false);
        };
        // check for `then` function on the result to allow use of a promise
        const result = (this.source as Function).call(undefined, originalElement.value, render);
        if (result && typeof result.then === 'function') {
            result.then((response: any[]) => render(response));
        }
    }

    /**
     * adjust set sources to needed format
     */
    prepListSource() {
        // allow complete control over the source handling via custom function
        if (typeof this.source === 'function') {
            return this.prepListSourceFunction();
        }

        // string source - treat as async endpoint
        if (typeof this.source === 'string' && this.source.length) {
            return this.prepListSourceAsync();
        }

        // array source - copy array
        if (Array.isArray(this.source) && this.source.length) {
            return this.prepListSourceArray();
        }

        // dropdown source
        if (this.elementIsSelect) {
            return this.prepListSourceDdl();
        }

        // checkboxlist source
        if (this.element.querySelector('input[type="checkbox"]')) {
            this.prepListSourceCheckboxes();
        }
    }

    /**
     * set input starting states - aria attributes, disabled state, starting value
     */
    setInputStartingStates(setAriaAttrs: boolean = true) {
        if (setAriaAttrs) {
            // update aria-describedby and aria-labelledby attributes if present
            const describedBy = this.element.getAttribute('aria-describedby');
            if (describedBy) {
                this.input.setAttribute('aria-describedby', describedBy);
            }
            const labelledBy = this.element.getAttribute('aria-labelledby');
            if (labelledBy) {
                this.input.setAttribute('aria-labelledby', labelledBy);
            }
        }

        // if selected item(s) already exists
        if (this.selected.length) {
            // for multi select variant, set selected items
            if (this.multiple) {
                this.buildMultiSelected();
                this.triggerAutoGrow();
            }
            // for single select variant, set value to match
            else {
                this.setInputValue(this.selected[0].label || '', true);
            }
        }

        // setup input description - done here in case value is affected above
        this.setInputDescription();

        // disable the control if the invoked element was disabled
        if (!!(this.element as HTMLInputElement | HTMLSelectElement).disabled) {
            this.disable(true);
        }
    }

    /**
     * build and insert component html structure
     */
    setHtml() {
        const o = this.options;
        const cssName = this.cssNameSpace;
        const wrapperClass = o.wrapperClassName ? ` ${o.wrapperClassName}` : '';
        const newHtml = [`<div id="${this.ids.WRAPPER}" class="${cssName}__wrapper${wrapperClass}">`];

        // add input
        const name = o.name ? ` name="${o.name}"` : ``;
        const inputClass = o.inputClassName ? ` ${o.inputClassName}` : '';
        const placeholder = o.placeholder
            ? ` placeholder="${o.placeholder}" aria-placeholder="${o.placeholder}"`
            : '';
        newHtml.push(
            `<input type="text" autocomplete="off" aria-expanded="false" aria-autocomplete="list" ` +
                `role="combobox" id="${this.ids.INPUT}" aria-owns="${this.ids.LIST}" ` +
                `class="${cssName}__input${inputClass}"${name}${placeholder} />`
        );

        // update corresponding label to now focus on the new input
        if (this.ids.ELEMENT) {
            const label = document.querySelector('[for="' + this.ids.ELEMENT + '"]');
            if (label) {
                label[ORIGINALLY_LABEL_FOR_PROP] = this.ids.ELEMENT;
                label[ORIGINALLY_LABEL_ID_PROP] = label.getAttribute('id');
                label.setAttribute('for', this.ids.INPUT);
                label.setAttribute('id', this.ids.LABEL);
                this.elementHasLabel = true;
            }
        }

        // button to show all available options
        if (o.showAllControl) {
            newHtml.push(
                `<span role="button" aria-label="${o.srShowAllText}" class="${cssName}__show-all" ` +
                    `tabindex="0" id="${this.ids.BUTTON}" aria-expanded="false"></span>`
            );
        }
        // add the list holder
        const explainerText = o.srListLabelText;
        const listClass = o.listClassName ? ` ${o.listClassName}` : '';
        const explainer = explainerText ? ` aria-label="${explainerText}"` : '';
        const describer = this.elementHasLabel ? ` aria-describedby="${this.ids.LABEL}"` : '';
        newHtml.push(
            `<ul id="${this.ids.LIST}" class="${cssName}__list${listClass}" role="listbox" ` +
                `aria-hidden="true" hidden="hidden"${explainer} ${describer}></ul>`
        );
        // add the screen reader assistance element
        newHtml.push(
            `<p class="hide hidden ${cssName}--hide ${cssName}__sr-assistance" ` +
                `id="${this.ids.SR_ASSISTANCE}">${o.srAssistiveText}</p>`
        );
        // add element for added screen reader announcements
        newHtml.push(
            `<p class="sr-only ${cssName}__sr-only ${cssName}__sr-announcements" ` +
                `id="${this.ids.SR_ANNOUNCEMENTS}" aria-live="polite" aria-atomic="true"></p>`
        );

        // close all and append
        newHtml.push(`</div>`);
        this.element.insertAdjacentHTML('afterend', newHtml.join(''));
    }

    /**
     * destroy component
     */
    destroy() {
        // return original label 'for' attribute back to element id, 'id' attribute to label original id
        const label: HTMLLabelElement = document.querySelector('[for="' + this.ids.INPUT + '"]');
        if (label && label[ORIGINALLY_LABEL_FOR_PROP]) {
            label.setAttribute('for', label[ORIGINALLY_LABEL_FOR_PROP]);
            delete label[ORIGINALLY_LABEL_FOR_PROP];

            if (label[ORIGINALLY_LABEL_ID_PROP]) {
                label.setAttribute('id', label[ORIGINALLY_LABEL_ID_PROP]);
                delete label[ORIGINALLY_LABEL_ID_PROP];
            }
        }

        // remove the document click if still bound
        if (this.documentClickBound) {
            document.removeEventListener('click', this.documentClick);
        }

        // destroy autogrow behaviour and events
        if (this.autoGrow && this.inputAutoWidth) {
            this.inputAutoWidth.destroy();
        }

        // remove the whole wrapper
        this.element.parentNode.removeChild(this.wrapper);
        delete this.element[API_STORAGE_PROP];

        // re-show original element
        this.show(this.element);

        // clear timers
        clearTimeout(this.filterTimer);
        clearTimeout(this.pollingTimer);
        clearTimeout(this.showAllPrepTimer);
        clearTimeout(this.announcementTimer);
        clearTimeout(this.componentBlurTimer);
        clearTimeout(this.elementChangeEventTimer);

        // clear stored element vars
        ['element', 'list', 'input', 'wrapper', 'showAll', 'srAnnouncements'].forEach(
            (entry: string) => (this[entry] = null)
        );
    }

    /**
     * initialise AriaAutocomplete
     */
    init(element: HTMLElement, options?: IAriaAutocompleteOptions) {
        this.selected = [];
        this.element = element;
        this.ids = new AutocompleteIds(element.id, options.id);
        this.elementIsInput = element.nodeName === 'INPUT';
        this.elementIsSelect = element.nodeName === 'SELECT';
        this.options = new AutocompleteOptions(options);

        // set these internally so that the component has to be properly destroyed to change them
        this.source = this.options.source;
        this.multiple = this.options.multiple;
        this.autoGrow = this.options.autoGrow;
        this.cssNameSpace = this.options.cssNameSpace;
        this.documentClick = this.handleComponentBlur.bind(this);

        // create html structure
        this.setHtml();

        // set main element vars
        this.list = document.getElementById(this.ids.LIST) as HTMLUListElement;
        this.input = document.getElementById(this.ids.INPUT) as HTMLInputElement;
        this.wrapper = document.getElementById(this.ids.WRAPPER) as HTMLDivElement;
        this.showAll = document.getElementById(this.ids.BUTTON) as HTMLSpanElement;
        this.srAnnouncements = document.getElementById(this.ids.SR_ANNOUNCEMENTS) as HTMLSpanElement;

        // set internal source array, from static elements if necessary
        this.prepListSource();

        // set any further classes on component wrapper based on options
        const wrapperClassesToAdd: string[] = [];
        if (this.options.showAllControl) {
            wrapperClassesToAdd.push(`${this.cssNameSpace}__wrapper--show-all`);
        }
        if (this.autoGrow) {
            wrapperClassesToAdd.push(`${this.cssNameSpace}__wrapper--autogrow`);
        }
        if (this.multiple) {
            wrapperClassesToAdd.push(`${this.cssNameSpace}__wrapper--multiple`);
        }
        if (wrapperClassesToAdd.length) {
            addClass(this.wrapper, wrapperClassesToAdd.join(' '));
        }

        // hide element and list manually
        this.hide(this.list); // pass in the list so that the onClose is not triggered
        this.hide(this.element);

        // set starting states for input - must be after source has been defined
        this.setInputStartingStates();

        // bind all necessary events
        this.bindEvents();

        // generate api object to expose
        // do this before onready, so that its context is correct
        this.api = new AutocompleteApi(this);

        // fire onready callback
        this.triggerOptionCallback('onReady', [this.wrapper]);
    }
}
