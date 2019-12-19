import './closest-polyfill';
import AutoGrow from './autogrow';
import {
    trimString,
    hasClass,
    addClass,
    removeClass,
    cleanString,
    isPrintableKey,
    mergeObjects,
    dispatchEvent,
    setElementState,
    processSourceArray,
    htmlToElement,
    searchVarPropsFor,
    removeDuplicatesAndLabel
} from './autocomplete-helpers';

let appIndex = 0;

const DEFAULT_OPTIONS = {
    /**
     * @description Give the autocomplete a name to be included in form submissions
     * (Instead of using this option, I would advise initialising the autocomplete on
     * an existing input that will be submitted, to also use any existing validation;
     * this approach is also compatible with the control in multiple mode)
     */
    name: '',
    /**
     * @type {String | String[] | Object[] | Function}
     * @description Specify source. See examples file for more specific usage.
     * @example ['Afghanistan', 'Albania', 'Algeria', ...more]
     * @example (query, render) => render(arrayToUse)
     */
    source: '',
    /**
     * @description Properties to use for label and value
     * when source is an Array of Objects
     */
    sourceMapping: {},
    /**
     * @type {String[]}
     * @description Additional properties to use when searching for a match.
     * `label` will always be used
     */
    alsoSearchIn: [],

    /**
     * @description Input delay after typing before running a search
     */
    delay: 100,
    /**
     * @description Minimum number of characters to run a search (includes spaces)
     */
    minLength: 1,
    /**
     * @description Maximum number of results to render. Also used with async endpoint
     */
    maxResults: 9999,
    /**
     * @description Render a control that triggers showing all options.
     * Runs a search with an empty query: '', and maxResults of 9999
     */
    showAllControl: false,
    /**
     * Confirm currently active selection when blurring off of the control. If
     * no active selection, will compare current input value against available labels
     */
    confirmOnBlur: true,

    /**
     * @description Allow multiple items to be selected
     */
    multiple: false,
    /**
     * @description Adjust input width to match its value.
     * Experimental, and a performance hit
     */
    autoGrow: false,
    /**
     * @description Maximum number of items that can be selected
     */
    maxItems: 9999,
    /**
     * @description If initialised element is an input, and in multiple mode,
     * character that separates the selected values e.g. "GLP,ZWE"
     */
    multipleSeparator: ',',
    /**
     * @description If input is empty and in multiple mode,
     * delete last selected item on backspace
     */
    deleteOnBackspace: false,

    /**
     * @description In async mode, parameter to use when adding the input value
     * to the endpoint String. e.g. https://some-endpoint?q=norway&limit=9999
     */
    asyncQueryParam: 'q',
    /**
     * @description In async mode, parameter to use when adding results limit
     * to the endpoint String. e.g. https://some-endpoint?q=norway&limit=9999
     */
    asyncMaxResultsParam: 'limit',

    /**
     * @description Placeholder text to show in generated input
     */
    placeholder: '',
    /**
     * @description Text to show (and announce to screen readers) if no results found.
     * If empty, the list of options will remain hidden when there are no results
     */
    noResultsText: 'No results',
    /**
     * @description String to prepend to classes for BEM naming
     * e.g. aria-autocomplete__input
     */
    cssNameSpace: 'aria-autocomplete',
    /**
     * @description Custom class name to add to the options list holder
     */
    listClassName: '',
    /**
     * @description Custom class name to add to the generated input
     */
    inputClassName: '',
    /**
     * @description Custom class name to add to the component wrapper
     */
    wrapperClassName: '',

    /**
     * @description In multiple mode, screen reader text used for element deletion.
     * Prepended to option label in aria-label attribute e.g. 'delete Canada'
     */
    srDeleteText: 'delete',
    /**
     * @description Screen reader text announced after deletion.
     * Apended to option label e.g. 'Canada deleted'
     */
    srDeletedText: 'deleted',
    /**
     * @description Value for aria-label attribute on the show all control
     */
    srShowAllText: 'Show all',
    /**
     * @description Screen reader text announced after confirming a selection.
     * Appended to option label e.g. 'Canada selected'
     */
    srSelectedText: 'selected',
    /**
     * @description Screen reader explainer added to the list element
     * via aria-label attribute
     */
    srListLabelText: 'Search suggestions',
    /**
     * @description Screen reader description announced when the input receives focus.
     * Only announced when input is empty
     */
    srAssistiveText:
        'When results are available use up and down arrows to review and ' +
        'enter to select. Touch device users, explore by touch or with swipe gestures.',
    /**
     * @description Screen reader announcement after results are rendered
     */
    srResultsText: length =>
        `${length} ${length === 1 ? 'result' : 'results'} available.`,

    /**
     * @description Callback before async call is made - receives the URL.
     * Can be used to format the endpoint URL by returning a String
     */
    onAsyncPrep: undefined,
    /**
     * @description Callback after async call completes - receives the xhr object.
     * Can be used to format the results by returning an Array
     */
    onAsyncSuccess: undefined,
    /**
     * @description Callback prior to rendering - receives the options that are going
     * to render. Can be used to format the results by returning an Array
     */
    onResponse: undefined,
    /**
     * @description Callback before a search is performed - receives the input value.
     * Can be used to alter the search value by returning a String
     */
    onSearch: undefined,
    /**
     * @description Callback after selection is made -
     * receives an object with the option details
     */
    onConfirm: undefined,
    /**
     * @description Callback after an autocomplete selection is deleted.
     * Fires in single-select mode when selection is deleted automatically.
     * Fires in multi-select mode when selected is deleted by user action
     */
    onDelete: undefined,
    /**
     * @description Callback when main script processing and initial rendering has finished
     */
    onReady: undefined,
    /**
     * @description Callback when list area closes - receives the list holder element
     */
    onClose: undefined,
    /**
     * @description Callback when list area opens - receives the list holder element
     */
    onOpen: undefined
};

/**
 * @param {Element} element
 * @param {Object=} options
 */
class AriaAutocomplete {
    constructor(element, options) {
        // fail silently if no list provided
        if (!element) {
            return;
        }

        // if instance already exists on the list element, do not re-initialise
        if (element.ariaAutocomplete && element.ariaAutocomplete.open) {
            return { api: element.ariaAutocomplete };
        }

        // vars defined later - related explicitly to core initialising params
        this.options;
        this.element;
        this.elementIsInput;
        this.elementIsSelect;

        // vars defined later - elements
        this.list;
        this.input;
        this.wrapper;
        this.showAll;
        this.srAnnouncements;

        // vars defined later - non elements
        this.ids;
        this.xhr;
        this.term;
        this.async;
        this.source;
        this.menuOpen;
        this.multiple;
        this.selected;
        this.disabled;
        this.autoGrow;
        this.filtering;
        this.cssNameSpace;
        this.forceShowAll;
        this.filteredSource; // filtered source items to render
        this.currentListHtml;
        this.inputPollingValue;
        this.currentSelectedIndex; // for storing index of currently focused option

        // document click
        this.documentClick;
        this.documentClickBound;

        // timers
        this.filterTimer;
        this.pollingTimer;
        this.announcementTimer;
        this.componentBlurTimer;
        this.elementChangeEventTimer;

        // storage for autoGrow class
        this.AutoGrowInput;

        // get going!
        this.init(element, options);
    }

    /**
     * trigger callbacks included in component options
     * @param {String} name
     * @param {Array=} args
     * @param {Any=} args
     */
    triggerOptionCallback(name, args, context) {
        context = typeof context === 'undefined' ? this.api : context;
        if (typeof this.options[name] === 'function') {
            return this.options[name].apply(context, args);
        }
    }

    /**
     * @description show element with CSS only - if none provided, set list state to visible
     * @param {Element=} element
     */
    show(element) {
        if (typeof element !== 'undefined') {
            const toRemove = `${this.cssNameSpace}--hide hide hidden`;
            removeClass(element, toRemove);
            return element.removeAttribute('hidden');
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
     * @description hide element with CSS only - if none provided, set list state to hidden
     * @param {Element=} element
     */
    hide(element) {
        if (typeof element !== 'undefined') {
            addClass(element, `${this.cssNameSpace}--hide hide hidden`);
            return element.setAttribute('hidden', 'hidden');
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
     * @description enable autocomplete (e.g. when under maxItems selected)
     */
    enable() {
        if (this.disabled) {
            this.disabled = false;
            this.input.disabled = false;
            const n = this.cssNameSpace;
            removeClass(this.input, `${n}__input--disabled disabled`);
            removeClass(this.wrapper, `${n}__wrapper--disabled disabled`);
            if (this.showAll) {
                this.showAll.setAttribute('tabindex', '0');
                removeClass(this.showAll, `${n}__show-all--disabled disabled`);
            }
        }
    }

    /**
     * @description disable autocomplete (e.g. when maxItems selected)
     */
    disable() {
        if (!this.disabled) {
            this.disabled = true;
            this.input.disabled = true;
            const n = this.cssNameSpace;
            addClass(this.input, `${n}__input--disabled disabled`);
            addClass(this.wrapper, `${n}__wrapper--disabled disabled`);
            if (this.showAll) {
                this.showAll.setAttribute('tabindex', '-1');
                addClass(this.showAll, `${n}__show-all--disabled disabled`);
            }
        }
    }

    /**
     * @description trigger input resizing if autogrow is enabled
     */
    triggerAutoGrow() {
        if (this.autoGrow && this.AutoGrowInput) {
            this.AutoGrowInput.trigger();
        }
    }

    /**
     * @description set input value to specific string, and related component vars
     * @param {String} value
     * @param {Boolean=} setPollingValue
     */
    setInputValue(value, setPollingValue = false) {
        this.input.value = this.term = value;
        if (setPollingValue) {
            this.inputPollingValue = value;
        }
    }

    /**
     * @description check if current input value is contained in a selection of options
     * @param {Array} options - array of objects with value and label properties
     * @param {String=} query - string to use - checks input value otherwise
     * @param {String=} prop - prop to check against in options array - defaults to 'label'
     * @returns {Number} index of array entry that matches, or -1 if none found
     */
    indexOfQueryIn(options, query = this.input.value, prop) {
        query = trimString(query).toLowerCase();
        if (query) {
            prop = prop || 'label';
            for (let i = 0, l = options.length; i < l; i += 1) {
                if (trimString(options[i][prop]).toLowerCase() === query) {
                    return i;
                }
            }
        }
        return -1;
    }

    /**
     * @description make a screen reader announcement
     * @param {String} text
     * @param {Number=} delay
     */
    announce(text, delay) {
        if (!text || !this.srAnnouncements) {
            return;
        }
        // in immediate case, do not user timer
        if (delay === 0) {
            return (this.srAnnouncements.textContent = text);
        }
        delay = typeof delay === 'number' ? delay : 400;
        if (this.announcementTimer) {
            clearTimeout(this.announcementTimer);
        }
        this.announcementTimer = setTimeout(() => {
            this.srAnnouncements.textContent = text;
        }, delay);
    }

    /**
     * @description check if element is a selected element in the DOM
     * @param {Element} element
     * @returns {Boolean}
     */
    isSelectedElem(element) {
        return (
            this.multiple &&
            element.ariaAutocompleteSelectedOption &&
            hasClass(element, `${this.cssNameSpace}__selected`)
        );
    }

    /**
     * @description get DOM elements for selected items
     * @returns {Element[]}
     */
    getSelectedElems() {
        const n = this.wrapper.childNodes;
        const a = [];
        for (let i = 0, l = n.length; i < l; i += 1) {
            if (this.isSelectedElem(n[i])) {
                a.push(n[i]);
            }
        }
        return a;
    }

    /**
     * @description remove object from selected
     * @param {Object} entry
     */
    removeEntryFromSelected(entry) {
        let index = this.selected.indexOf(entry);
        if (index === -1) {
            // value check, in case explicit object reference did not work
            for (let i = 0, l = this.selected.length; i < l; i += 1) {
                if (this.selected[i].value === entry.value) {
                    index = i;
                    break;
                }
            }
        }
        // set element state, dispatch change event, set selected array,
        // trigger callback, build selected, and do screen reader announcement
        if (index > -1 && this.selected[index]) {
            const option = mergeObjects(this.selected[index]);
            const label = option.label;
            setElementState(option.element, false, this);
            this.selected.splice(index, 1);
            this.triggerOptionCallback('onDelete', [option]);
            this.buildMultiSelected();
            this.announce(`${label} ${this.options.srDeletedText}`, 0);
        }
    }

    /**
     * @description re-build the html showing the selected items
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
        const currentSelectedElems = this.getSelectedElems();
        if (!this.selected.length && !currentSelectedElems.length) {
            return;
        }

        // cycle through existing elements, and remove any not in the selected array
        const current = [];
        let i = currentSelectedElems.length;
        while (i--) {
            let option = currentSelectedElems[i].ariaAutocompleteSelectedOption;
            let l = this.selected.length;
            let isInSelected = false;
            while (l--) {
                let selected = this.selected[l];
                if (selected === option || selected.value === option.value) {
                    isInSelected = true;
                    break;
                }
            }
            if (isInSelected) {
                current.push(currentSelectedElems[i]);
            } else {
                this.wrapper.removeChild(currentSelectedElems[i]);
            }
        }

        // cycle through selected array, and add elements for any not represented by one
        const deleteText = this.options.srDeleteText;
        const fragment = document.createDocumentFragment();
        const selectedClass = `${this.cssNameSpace}__selected`;
        for (let i = 0, l = this.selected.length; i < l; i += 1) {
            const selected = this.selected[i];
            let l = current.length;
            let isInDom = false;
            while (l--) {
                let option = current[l].ariaAutocompleteSelectedOption;
                if (option === selected || option.value === selected.value) {
                    isInDom = true;
                    break;
                }
            }
            if (!isInDom) {
                const label = selected.label;
                const span = htmlToElement(
                    `<span role="button" class="${selectedClass}" ` +
                        `tabindex="0" aria-label="${deleteText} ${label}">` +
                        `${label}</span>`
                );
                span.ariaAutocompleteSelectedOption = selected;
                fragment.appendChild(span);
            }
        }
        if (fragment.childNodes && fragment.childNodes.length) {
            this.wrapper.insertBefore(fragment, this.list);
        }

        // set ids on elements
        const ids = [];
        // get selected elements again, as some may have been added or removed
        const nowSelectedElems = this.getSelectedElems();
        for (let i = 0, l = nowSelectedElems.length; i < l; i += 1) {
            const id = `${this.ids.OPTION_SELECTED}-${i}`;
            nowSelectedElems[i].setAttribute('id', id);
            ids.push(id);
        }
        ids.push(this.ids.LIST);

        // set input aria-owns
        this.input.setAttribute('aria-owns', ids.join(' '));

        // in autogrow mode, hide the placeholder if there are selected items
        if (this.autoGrow && this.options.placeholder) {
            const toSet = this.selected.length ? '' : this.options.placeholder;
            this.input.setAttribute('placeholder', toSet);
        }
    }

    /**
     * @description set the aria-describedby attribute on the input
     */
    setInputDescription() {
        const exists = this.input.getAttribute('aria-describedby');
        const current = trimString(exists || '');
        let describedBy = current.replace(this.ids.SR_ASSISTANCE, '');

        if (this.input.value.length === 0) {
            describedBy = describedBy + ' ' + this.ids.SR_ASSISTANCE;
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
     * @description reset classes and aria-selected attribute for all visible filtered options
     */
    resetOptionAttributes() {
        const cssName = this.cssNameSpace;
        const nodes = this.list.childNodes;
        let l = nodes.length;
        while (l--) {
            removeClass(nodes[l], `${cssName}__option--focused focused focus`);
            nodes[l].setAttribute('aria-selected', 'false');
        }
    }

    /**
     * @description move focus to correct option, or to input (on up and down arrows)
     * @param {Event} event
     * @param {Number} index
     */
    setOptionFocus(event, index) {
        // set aria-selected to false and remove focused class
        this.resetOptionAttributes();

        // if negative index, or no options available, focus on input
        const options = this.list.childNodes;
        if (index < 0 || !options || !options.length) {
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

        // if option found, focus...
        const toFocus = options[index];
        if (toFocus && typeof toFocus.getAttribute('tabindex') === 'string') {
            this.currentSelectedIndex = index;
            const toAdd = `${this.cssNameSpace}__option--focused focused focus`;
            addClass(toFocus, toAdd);
            toFocus.setAttribute('aria-selected', 'true');
            toFocus.focus();
            return;
        }

        // reset index just in case
        this.currentSelectedIndex = -1;
    }

    /**
     * @description set values and dispatch events based on any DOM elements in the selected array
     */
    setSourceElementValues() {
        const valToSet = [];
        for (let i = 0, l = this.selected.length; i < l; i += 1) {
            const entry = this.selected[i];
            valToSet.push(entry.value);
            setElementState(entry.element, true, this); // element processing
        }

        // set original input value
        if (this.elementIsInput) {
            const valToSetString = valToSet.join(
                this.options.multipleSeparator
            );
            if (valToSetString !== this.element.value) {
                this.element.value = valToSetString;
                dispatchEvent(this.element, 'change');
            }
        }

        // included in case of multi-select mode used with a <select> element as the source
        if (!this.selected.length && this.elementIsSelect) {
            this.element.value = '';
        }
    }

    /**
     * @description select option from the list by index
     * @param {Event} event
     * @param {Number} index
     * @param {Boolean=} focusAfterSelection
     */
    handleOptionSelect(event, index, focusAfterSelection = true) {
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
        const option = mergeObjects(this.filteredSource[index]);
        // detect if selected option is already in selected array
        let l = this.selected.length;
        let alreadySelected = false;
        while (l--) {
            if (this.selected[l].value === option.value) {
                alreadySelected = true;
                break;
            }
        }

        this.setInputValue(this.multiple ? '' : option.label, true);
        this.triggerAutoGrow();

        // reset selected array in single select mode
        if (!alreadySelected && !this.multiple) {
            this.selected = [];
        }

        // (re)set values of any DOM elements based on selected array
        if (!alreadySelected) {
            this.selected.push(option);
            this.setSourceElementValues();
            this.buildMultiSelected(); // rebuild multi-selected if needed
        }

        this.triggerOptionCallback('onConfirm', [option]);
        this.announce(`${option.label} ${this.options.srSelectedText}`, 0);

        // return focus to input
        if (!this.disabled && focusAfterSelection !== false) {
            this.input.focus();
        }

        // close menu after option selection, and after returning focus to input
        this.hide();
    }

    /**
     * @description remove selected entries from results if in multiple mode
     * @param {Array} results
     * @returns {Array}
     */
    removeSelectedFromResults(results) {
        if (!this.multiple || !this.selected.length) {
            return results;
        }
        const toReturn = [];
        resultsLoop: for (let i = 0, l = results.length; i < l; i += 1) {
            const selected = this.selected;
            const result = results[i];
            for (let j = 0, k = selected.length; j < k; j += 1) {
                let labelMatch = result.label === selected[j].label;
                if (labelMatch && result.value === selected[j].value) {
                    continue resultsLoop;
                }
            }
            toReturn.push(result);
        }
        return toReturn;
    }

    /**
     * @description final filtering and render for list options, and render
     * @param {Array} results
     */
    setListOptions(results) {
        const toShow = [];

        // now commit to setting the filtered source
        const mapping = this.options.sourceMapping;
        // if in multiple mode, exclude items already in the selected array
        const updated = this.removeSelectedFromResults(results);
        // allow callback to alter the response before rendering
        const callback = this.triggerOptionCallback('onResponse', updated);
        this.filteredSource = callback
            ? processSourceArray(callback, mapping)
            : updated;

        // build up the list html
        const optionId = this.ids.OPTION;
        const cssName = this.cssNameSpace;
        const length = this.filteredSource.length;
        const maxResults = this.forceShowAll ? 9999 : this.options.maxResults;
        for (let i = 0; i < length && i < maxResults; i += 1) {
            toShow.push(
                `<li tabindex="-1" aria-selected="false" role="option" class="${cssName}__option" ` +
                    `id="${optionId}--${i}" aria-posinset="${i + 1}" ` +
                    `aria-setsize="${length}">${this.filteredSource[i].label}</li>`
            );
        }

        // set has-results or no-results class on the list element
        if (toShow.length) {
            addClass(this.list, `${cssName}__list--has-results`);
            removeClass(this.list, `${cssName}__list--no-results`);
        } else {
            removeClass(this.list, `${cssName}__list--has-results`);
            addClass(this.list, `${cssName}__list--no-results`);
        }

        // no results text handling
        let announce;
        const noText = this.options.noResultsText;
        if (!toShow.length && typeof noText === 'string' && noText.length) {
            announce = noText;
            let optionClass = `${cssName}__option`;
            toShow.push(
                `<li class="${optionClass} ${optionClass}--no-results">${noText}</li>`
            );
        }

        // remove loading class(es) and reset variables
        this.cancelFilterPrep();

        // announce to screen reader
        if (!announce) {
            announce = this.triggerOptionCallback('srResultsText', [length]);
        }
        this.announce(announce);

        // render the list, only if we have to
        // time taken for string comparison is worth it to not have to re-parse and re-render the list
        const newListHtml = toShow.join('');
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
        // aria-expanded attribute on showAllControl is controlled in .show() method
        this.forceShowAll = false;
    }

    /**
     * @description trigger async call for options to render
     * @param {String} value
     * @param {Boolean=} isFirstCall
     */
    handleAsync(value, isFirstCall = false) {
        // abort any current call first
        if (this.xhr) {
            this.xhr.abort();
        }

        const xhr = new XMLHttpRequest();
        const encode = encodeURIComponent;
        const isShowAll = this.forceShowAll;
        const unlimited = isShowAll || isFirstCall;
        const context = isFirstCall ? null : this.api;
        const baseAmount = this.multiple ? this.selected.length : 0;
        const ampersandOrQuestionMark = /\?/.test(this.source) ? '&' : '?';
        let url =
            this.source +
            ampersandOrQuestionMark +
            `${encode(this.options.asyncQueryParam)}=${encode(value)}&` +
            `${encode(this.options.asyncMaxResultsParam)}=` +
            `${unlimited ? 9999 : baseAmount + this.options.maxResults}`;
        url = this.triggerOptionCallback('onAsyncPrep', [url], context) || url;

        xhr.open('GET', url);
        xhr.onload = () => {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200) {
                    // return forceShowAll to previous state before the options render
                    this.forceShowAll = isShowAll;
                    const callbackResponse = this.triggerOptionCallback(
                        'onAsyncSuccess',
                        [value, xhr],
                        context
                    );
                    const mapping = this.options.sourceMapping;
                    const source = callbackResponse || xhr.responseText;
                    const items = processSourceArray(source, mapping, false);

                    if (isFirstCall) {
                        this.prepSelectedFromArray(items);
                        this.setInputStartingStates(false);
                    } else {
                        this.setListOptions(items);
                    }
                }
            }
        };

        // allow the creation of an uncancellable call to use on first load
        if (!isFirstCall) {
            this.xhr = xhr;
        }

        xhr.send();
    }

    /**
     * @description trigger filtering using a value
     * @param {String} value
     */
    filter(value) {
        // fail silently if no value is provided
        if (typeof value !== 'string') {
            this.cancelFilterPrep();
            return;
        }

        // allow onSearch callback to affect the searched value
        // only permitted when not a forceShowAll case
        let forceShowAll = this.forceShowAll;
        let callbackResponse = this.triggerOptionCallback('onSearch', [value]);
        if (!forceShowAll && typeof callbackResponse === 'string') {
            value = callbackResponse;
        }

        // store search term - used for comparison in filterPrep
        this.term = this.inputPollingValue = value;

        // async handling
        if (this.async) {
            this.handleAsync(value);
            // set show all to false immediately as may be used in other places
            this.forceShowAll = false;
            return;
        }

        // handle the source as a function
        if (typeof this.source === 'function') {
            this.source.call(this.api, this.term, response => {
                let mapping = this.options.sourceMapping;
                let result = processSourceArray(response, mapping);
                this.setListOptions(result);
            });
            return;
        }

        // if empty string, show all
        if (!value) {
            forceShowAll = true;
        }

        // existing list handling
        const toReturn = [];
        if (this.source && this.source.length) {
            let check = ['ariaAutocompleteCleanedLabel'];
            if (!forceShowAll) {
                value = cleanString(value, true);
                let searchIn = this.options.alsoSearchIn;
                if (Array.isArray(searchIn) && searchIn.length) {
                    check = removeDuplicatesAndLabel(check.concat(searchIn));
                }
            }
            for (let i = 0, l = this.source.length; i < l; i += 1) {
                const entry = this.source[i];
                if (forceShowAll || searchVarPropsFor(entry, check, value)) {
                    toReturn.push(entry);
                }
            }
        }

        this.setListOptions(toReturn);
    }

    /**
     * @description cancel filter timer and remove loading classes
     */
    cancelFilterPrep() {
        if (this.filterTimer) {
            clearTimeout(this.filterTimer);
        }
        const nameSpace = this.cssNameSpace;
        removeClass(this.wrapper, `${nameSpace}__wrapper--loading loading`);
        removeClass(this.input, `${nameSpace}__input--loading loading`);
        this.filtering = false;
    }

    /**
     * @description checks before filtering, and set filter timer
     * @param {Event} e
     * @param {Boolean=} doValueOverrideCheck - whether to check input value against selected item(s)
     * @param {Boolean=} runNow
     */
    filterPrep(e, doValueOverrideCheck = false, runNow = false) {
        const forceShowAll = this.forceShowAll;
        const delay = forceShowAll || runNow ? 0 : this.options.delay;

        // clear timers
        this.cancelFilterPrep();
        this.filtering = true;
        this.filterTimer = setTimeout(() => {
            let value = this.input.value;
            // treat as empty search if...
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
            this.inputPollingValue = value; // set polling value, even if search criteria not met

            if (!forceShowAll && value.length < this.options.minLength) {
                this.hide();
                return;
            }

            // try catch used due to permissions issues in some cases
            let modifier;
            try {
                let keydown = e && e.type === 'keydown';
                modifier = keydown && (e.altKey || e.ctrlKey || e.metaKey); // allow shift key, just in case...
            } catch (e) {}

            // prevent search being run again with the same value
            const equalVals = value === '' ? false : value === this.term;
            if (!equalVals || (equalVals && !this.menuOpen && !modifier)) {
                let n = this.cssNameSpace;
                addClass(this.wrapper, `${n}__wrapper--loading loading`);
                addClass(this.input, `${n}__input--loading loading`);
                this.currentSelectedIndex = -1;
                this.filter(value);
            }
        }, delay);
    }

    /**
     * @description trigger filter prep in showAll mode
     * @param {Event} event
     */
    filterPrepShowAll(event) {
        if (this.disabled) {
            return;
        }
        // need to use a timer, as the wrapper focus out will fire after the click event
        if (this.showAllPrepTimer) {
            clearTimeout(this.showAllPrepTimer);
        }
        this.showAllPrepTimer = setTimeout(() => {
            if (this.componentBlurTimer) {
                clearTimeout(this.componentBlurTimer);
            }
            event.preventDefault();
            this.forceShowAll = true;
            this.filterPrep(event, false, true);
        });
    }

    /**
     * @description blur behaviour for hiding list and removing focus class(es)
     * @param {Event} event
     * @param {Boolean=} force - fire instantly and force blurring out of the component
     */
    handleComponentBlur(event, force = false) {
        if (this.componentBlurTimer) {
            clearTimeout(this.componentBlurTimer);
        }
        // use a timeout to ensure this blur fires after other focus events
        // and in case the user focuses back in immediately
        const delay = force ? 0 : 100;
        this.componentBlurTimer = setTimeout(() => {
            // do nothing if blurring to an element within the list
            const activeElem = document.activeElement;
            if (
                !force &&
                activeElem &&
                !(this.showAll && this.showAll === activeElem) && // exception for show all button
                !activeElem.ariaAutocompleteSelectedOption // exception for selected items
            ) {
                // must base this on the wrapper to allow scrolling the list in IE
                if (this.wrapper.contains(activeElem)) {
                    return;
                }
            }

            // cancel any running async call
            if (this.xhr) {
                this.xhr.abort();
            }

            // confirmOnBlur behaviour
            const isQueryIn = this.indexOfQueryIn.bind(this);
            if (!force && this.options.confirmOnBlur && this.menuOpen) {
                // if blurring from an option (currentSelectedIndex > -1), select it
                let toUse = this.currentSelectedIndex;
                if (typeof toUse !== 'number' || toUse === -1) {
                    // otherwise check for exact match between current input value and available items
                    toUse = isQueryIn(this.filteredSource);
                }
                this.handleOptionSelect({}, toUse, false);
            }

            this.cancelFilterPrep();
            this.hide();

            // in single select case, if current value and chosen value differ, clear selected and input value
            if (!this.multiple && isQueryIn(this.selected) === -1) {
                const inputOrDdl = this.elementIsInput || this.elementIsSelect;
                if (inputOrDdl && this.element.value !== '') {
                    this.element.value = '';
                    dispatchEvent(this.element, 'change');
                }
                if (this.selected.length) {
                    this.removeEntryFromSelected(this.selected[0]);
                }
                this.setInputValue('', true);
            }

            if (this.multiple) {
                this.setInputValue('', true);
            }

            // trigger input resizing
            this.triggerAutoGrow();

            // unbind document click
            if (this.documentClickBound) {
                this.documentClickBound = false;
                document.removeEventListener('click', this.documentClick);
            }
        }, delay);
    }

    /**
     * @description enter keydown for selections
     * @param {Event} event
     */
    handleEnterKey(event) {
        // if in multiple mode, and event target was a selected item, remove it
        if (this.isSelectedElem(event.target)) {
            const option = event.target.ariaAutocompleteSelectedOption;
            return this.removeEntryFromSelected(option);
        }

        if (this.disabled) {
            return;
        }

        if (this.showAll && event.target === this.showAll) {
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
        if (event.target === this.input) {
            this.filterPrep(event, false, true);
        }
    }
    /**
     * @description down arrow usage - option focus, or search all
     * @param {Event} event
     */
    handleDownArrowKey(event) {
        event.preventDefault();
        // if closed, and text is long enough, run search
        if (!this.menuOpen) {
            this.forceShowAll = this.options.minLength < 1;
            if (
                this.forceShowAll ||
                this.input.value.length >= this.options.minLength
            ) {
                this.filterPrep(event);
            }
        }
        // move focus to downward option
        if (this.menuOpen && !this.filtering) {
            const current = this.currentSelectedIndex;
            if (typeof current !== 'number' || current < 0) {
                this.setOptionFocus(event, 0);
            } else {
                this.setOptionFocus(event, current + 1);
            }
        }
    }

    /**
     * @description up arrow usage - option focus, or return focus to input
     * @param {Event} event
     */
    handleUpArrowKey(event) {
        event.preventDefault();
        const usable = !this.disabled && this.menuOpen;
        if (usable && typeof this.currentSelectedIndex === 'number') {
            this.setOptionFocus(event, this.currentSelectedIndex - 1);
        }
    }

    /**
     * @description standard keydown handling (excluding enter, up, down, escape)
     * @param {Event} event
     */
    handleKeyDownDefault(event) {
        const targetIsInput = event.target === this.input;
        // on space, if focus state is on any other item, treat as enter
        if (event.keyCode === 32 && !targetIsInput) {
            event.preventDefault();
            return this.handleEnterKey(event);
        }

        if (this.disabled) {
            return;
        }

        // on backspace, if using empty input in multiple mode, delete last selected entry
        const selectedLength = this.selected && this.selected.length;
        if (
            this.options.deleteOnBackspace &&
            this.input.value === '' &&
            event.keyCode === 8 &&
            selectedLength &&
            targetIsInput &&
            this.multiple
        ) {
            this.removeEntryFromSelected(this.selected[selectedLength - 1]);
            return;
        }

        // any printable character not on input, return focus to input
        const printableKey = isPrintableKey(event.keyCode);
        const focusInput = !targetIsInput && printableKey;
        if (focusInput) {
            this.input.focus();
        }

        // trigger filtering - done here, instead of using input event, due to IE9 issues
        if (focusInput || (targetIsInput && printableKey)) {
            this.filterPrep(event);
        }
    }

    /**
     * @description component keydown handling
     * @param {Event} event
     */
    prepKeyDown(event) {
        switch (event.keyCode) {
            case 13: // on enter
                this.handleEnterKey(event);
                break;
            case 27: // on escape
                this.handleComponentBlur(event, true);
                break;
            case 38: // on up
                this.handleUpArrowKey(event);
                break;
            case 40: // on down
                this.handleDownArrowKey(event);
                break;
            default:
                this.handleKeyDownDefault(event);
                break;
        }
    }

    /**
     * @description cancel checking for input value changes from external causes
     */
    cancelPolling() {
        if (this.pollingTimer) {
            clearTimeout(this.pollingTimer);
        }
    }

    /**
     * @description start checking for input value changes from causes that bypass event detection
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
     * @description bind component events to generated elements
     */
    bindEvents() {
        // when focus is moved outside of the component, close everything
        this.wrapper.addEventListener('focusout', event => {
            this.handleComponentBlur(event, false);
        });
        // reset selected index
        this.wrapper.addEventListener('focusin', event => {
            if (!this.list.contains(event.target)) {
                this.currentSelectedIndex = -1;
            }
        });
        // handle all keydown events inside the component
        this.wrapper.addEventListener('keydown', event => {
            this.prepKeyDown(event);
        });
        // if clicking directly on the wrapper, move focus to the input
        this.wrapper.addEventListener('click', event => {
            if (event.target === this.wrapper) {
                this.input.focus();
                return;
            }
            if (this.isSelectedElem(event.target)) {
                const option = event.target.ariaAutocompleteSelectedOption;
                this.removeEntryFromSelected(option);
            }
        });

        const wrapperFocusClasses = `${this.cssNameSpace}__wrapper--focused focused focus`;
        const inputFocusClasses = `${this.cssNameSpace}__input--focused focused focus`;
        // when blurring out of input, remove classes
        this.input.addEventListener('blur', () => {
            removeClass(this.wrapper, wrapperFocusClasses);
            removeClass(this.input, inputFocusClasses);
            this.cancelPolling();
        });
        // trigger filter on input event as well as keydown (covering bases)
        this.input.addEventListener('input', event => {
            this.filterPrep(event);
        });
        // when specifically clicking on input, if menu is closed, and value is long enough, search
        this.input.addEventListener('click', event => {
            const open = this.menuOpen;
            if (!open && this.input.value.length >= this.options.minLength) {
                this.filterPrep(event, true);
            }
        });
        // when focusing on input, reset selected index and trigger search handling
        this.input.addEventListener('focusin', () => {
            addClass(this.wrapper, wrapperFocusClasses);
            addClass(this.input, inputFocusClasses);
            this.startPolling();
            if (!this.disabled && !this.menuOpen) {
                this.filterPrep(event, true);
            }
        });

        // show all button click
        if (this.showAll) {
            this.showAll.addEventListener('click', event => {
                this.filterPrepShowAll(event);
            });
        }

        // clear any current focus position when hovering into the list
        this.list.addEventListener('mouseenter', event => {
            this.resetOptionAttributes();
        });
        // trigger options selection
        this.list.addEventListener('click', event => {
            if (event.target !== this.list) {
                const childNodes = this.list.childNodes;
                if (childNodes.length) {
                    const nodeIndex = [].indexOf.call(childNodes, event.target);
                    this.handleOptionSelect(event, nodeIndex);
                }
            }
        });

        // setup input autogrow behaviour
        if (this.autoGrow) {
            this.AutoGrowInput = new AutoGrow(this.input);
        }
    }

    /**
     * @description set starting source array based on child checkboxes
     */
    prepListSourceCheckboxes() {
        this.multiple = true; // force multiple in this case
        // reset source and use checkboxes
        this.source = [];
        const elements = this.element.querySelectorAll(
            'input[type="checkbox"]'
        );
        for (let i = 0, l = elements.length; i < l; i += 1) {
            const checkbox = elements[i];
            // must have a value other than empty string
            if (!checkbox.value) {
                continue;
            }
            const toPush = { element: checkbox, value: checkbox.value };
            // label searching
            let label = checkbox.closest('label');
            if (!label && checkbox.id) {
                label = document.querySelector('[for="' + checkbox.id + '"]');
            }
            if (label) {
                toPush.label = label.textContent;
            }
            // if no label so far, re-use value
            if (!toPush.label) {
                toPush.label = toPush.value;
            }
            toPush.ariaAutocompleteCleanedLabel = cleanString(toPush.label);
            this.source.push(toPush);
            // add to selected if applicable
            if (checkbox.checked) {
                this.selected.push(toPush);
            }
        }
    }

    /**
     * @description set starting source array based on <select> options
     */
    prepListSourceDdl() {
        this.multiple = this.element.multiple; // force multiple to match select
        // reset source and use options
        this.source = [];
        const options = this.element.querySelectorAll('option');
        for (let i = 0, l = options.length; i < l; i += 1) {
            const option = options[i];
            // must have a value other than empty string
            if (!option.value) {
                continue;
            }
            const toPush = {
                element: option,
                value: option.value,
                label: option.textContent
            };
            toPush.ariaAutocompleteCleanedLabel = cleanString(toPush.label);
            this.source.push(toPush);
            // add to selected if applicable
            if (option.selected) {
                this.selected.push(toPush);
            }
        }
    }

    /**
     * @description build up selected array if starting element was an input, and had a value
     * @param {Object[]} source
     */
    prepSelectedFromArray(source) {
        const value = this.elementIsInput && this.element.value;
        if (value && source && source.length) {
            // account for multiple mode
            const multiple = this.options.multiple;
            const separator = this.options.multipleSeparator;
            const valueArr = multiple ? value.split(separator) : [value];

            for (let i = 0, l = valueArr.length; i < l; i += 1) {
                const val = valueArr[i];
                const isQueryIn = this.indexOfQueryIn;
                // make sure it is not already in the selected array
                const isSelected = isQueryIn(this.selected, val, 'value') > -1;

                // but is in the source array (check via 'value', not 'label')
                if (!isSelected) {
                    const indexInSource = isQueryIn(source, val, 'value');
                    if (indexInSource > -1) {
                        this.selected.push(source[indexInSource]);
                    }
                }
            }
        }
    }

    /**
     * @description adjust starting source array to format needed, and set selected
     */
    prepListSourceArray() {
        const mapping = this.options.sourceMapping;
        this.source = processSourceArray(this.source, mapping);
        this.prepSelectedFromArray(this.source);
    }

    /**
     * @description trigger source string endpoint to generate selected array
     */
    prepListSourceAsync() {
        this.async = true;
        if (this.elementIsInput && this.element.value) {
            this.handleAsync(this.element.value, true);
        }
    }

    /**
     * @description process source function to generate selected array
     */
    prepListSourceFunction() {
        if (this.elementIsInput && this.element.value) {
            this.source.call(undefined, this.element.value, response => {
                this.prepSelectedFromArray(
                    processSourceArray(response, this.options.sourceMapping)
                );
                this.setInputStartingStates(false);
            });
        }
    }

    /**
     * @description adjust set sources to needed format
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
     * @description set input starting states - aria attributes, disabled state, starting value
     * @param {Boolean=} setAriaAttrs
     */
    setInputStartingStates(setAriaAttrs = true) {
        if (setAriaAttrs) {
            // update corresponding label to now focus on the new input
            if (this.ids.ELEMENT) {
                const label = document.querySelector(
                    '[for="' + this.ids.ELEMENT + '"]'
                );
                if (label) {
                    label.ariaAutocompleteOriginalFor = this.ids.ELEMENT;
                    label.setAttribute('for', this.ids.INPUT);
                }
            }

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
            }
            // for single select variant, set value to match
            else {
                this.setInputValue(this.selected[0].label || '', true);
                this.triggerAutoGrow();
            }
        }

        // setup input description - done here in case value is affected above
        this.setInputDescription();

        // disable the control if the invoked element was disabled
        if (!!this.element.disabled) {
            this.disable();
        }
    }

    /**
     * @description build and insert component html structure
     */
    setHtml() {
        const o = this.options;
        const cssName = this.cssNameSpace;
        const wrapperClass = o.wrapperClassName ? ` ${o.wrapperClassName}` : '';
        const newHtml = [
            `<div id="${this.ids.WRAPPER}" class="${cssName}__wrapper${wrapperClass}">`
        ];

        // add input
        const name = o.name ? ` ${o.name}` : ``;
        const inputClass = o.inputClassName ? ` ${o.inputClassName}` : '';
        newHtml.push(
            `<input type="text" autocomplete="off" aria-expanded="false" aria-autocomplete="list" ` +
                `role="combobox" id="${this.ids.INPUT}" placeholder="${o.placeholder}" ` +
                `aria-owns="${this.ids.LIST}" aria-placeholder="${o.placeholder}" ` +
                `class="${cssName}__input${inputClass}"${name} />`
        );

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
        newHtml.push(
            `<ul id="${this.ids.LIST}" class="${cssName}__list${listClass}" role="listbox" ` +
                `hidden="hidden"${explainer}></ul>`
        );
        // add the screen reader assistance element
        newHtml.push(
            `<span class="sr-only ${cssName}__sr-only ${cssName}__sr-assistance" ` +
                `id="${this.ids.SR_ASSISTANCE}">${o.srAssistiveText}</span>`
        );
        // add element for added screen reader announcements
        newHtml.push(
            `<span class="sr-only ${cssName}__sr-only ${cssName}__sr-announcements" ` +
                `id="${this.ids.SR_ANNOUNCEMENTS}" aria-live="polite" aria-atomic="true"></span>`
        );

        // close all and append
        newHtml.push(`</div>`);
        this.element.insertAdjacentHTML('afterend', newHtml.join(''));
    }

    /**
     * @description generate api object to expose on the element
     */
    generateApi() {
        this.api = {
            open: () => this.show.call(this),
            close: () => this.hide.call(this),
            filter: val => this.filter.call(val)
        };

        const a = [
            'options',
            'destroy',
            'enable',
            'disable',
            'input',
            'wrapper',
            'list',
            'selected'
        ];

        for (let i = 0, l = a.length; i < l; i += 1) {
            this.api[a[i]] =
                typeof this[a[i]] === 'function'
                    ? () => this[a[i]].call(this)
                    : this[a[i]];
        }

        // store api on original element
        this.element.ariaAutocomplete = this.api;
    }

    /**
     * @description destroy component
     */
    destroy() {
        // return original label 'for' attribute back to element id
        const label = document.querySelector('[for="' + this.ids.INPUT + '"]');
        if (label && label.ariaAutocompleteOriginalFor) {
            label.setAttribute('for', label.ariaAutocompleteOriginalFor);
            delete label.ariaAutocompleteOriginalFor;
        }
        // remove the document click if still bound
        if (this.documentClickBound) {
            document.removeEventListener('click', this.documentClick);
        }
        // destroy autogrow behaviour and events
        if (this.autoGrow && this.AutoGrowInput) {
            this.AutoGrowInput.destroy();
        }
        // remove the whole wrapper
        this.element.parentNode.removeChild(this.wrapper);
        delete this.element.ariaAutocomplete;
        // re-show original element
        this.show(this.element);
        // set all instance properties to null to clean up DOMNode references
        for (let i in this) {
            if (this.hasOwnProperty(i)) {
                this[i] = null;
            }
        }
    }

    /**
     * @description initialise AriaAutocomplete
     * @param {Element} element
     * @param {Object=} options
     */
    init(element, options) {
        // ids used for DOM queries and accessibility attributes e.g. aria-controls
        appIndex += 1;
        this.ids = {};
        this.ids.ELEMENT = element.id;
        this.ids.PREFIX = `${element.id || ''}aria-autocomplete-${appIndex}`;
        this.ids.LIST = `${this.ids.PREFIX}-list`;
        this.ids.INPUT = `${this.ids.PREFIX}-input`;
        this.ids.BUTTON = `${this.ids.PREFIX}-button`;
        this.ids.OPTION = `${this.ids.PREFIX}-option`;
        this.ids.WRAPPER = `${this.ids.PREFIX}-wrapper`;
        this.ids.OPTION_SELECTED = `${this.ids.OPTION}-selected`;
        this.ids.SR_ASSISTANCE = `${this.ids.PREFIX}-sr-assistance`;
        this.ids.SR_ANNOUNCEMENTS = `${this.ids.PREFIX}-sr-announcements`;

        this.selected = [];
        this.element = element;
        this.elementIsInput = element.nodeName === 'INPUT';
        this.elementIsSelect = element.nodeName === 'SELECT';
        this.options = mergeObjects(DEFAULT_OPTIONS, options);

        // set these internally so that the component has to be properly destroyed to change them
        this.source = this.options.source;
        this.multiple = this.options.multiple;
        this.autoGrow = this.options.autoGrow;
        this.cssNameSpace = this.options.cssNameSpace;
        this.documentClick = this.handleComponentBlur.bind(this);

        // create html structure
        this.setHtml();

        // additional app variables
        this.list = document.getElementById(this.ids.LIST);
        this.input = document.getElementById(this.ids.INPUT);
        this.wrapper = document.getElementById(this.ids.WRAPPER);
        this.showAll = document.getElementById(this.ids.BUTTON);
        this.srAnnouncements = document.getElementById(
            this.ids.SR_ANNOUNCEMENTS
        );

        // set internal source array, from static elements if necessary
        this.prepListSource();

        // set any further classes on component wrapper based on options
        let wrapperClass = '';
        if (this.options.showAllControl) {
            wrapperClass += ` ${this.cssNameSpace}__wrapper--show-all`;
        }
        if (this.autoGrow) {
            wrapperClass += ` ${this.cssNameSpace}__wrapper--autogrow`;
        }
        if (this.multiple) {
            wrapperClass += ` ${this.cssNameSpace}__wrapper--multiple`;
        }
        if (wrapperClass) {
            addClass(this.wrapper, wrapperClass);
        }

        // hide element and list manually
        this.hide(this.list); // pass in the list so that the onClose is not triggered
        this.hide(this.element);

        // generate api object to expose
        this.generateApi();

        // set starting states for input - must be after source has been defined
        this.setInputStartingStates();

        // bind all necessary events
        this.bindEvents();

        // fire onready callback
        this.triggerOptionCallback('onReady', [this.wrapper]);
    }
}

/**
 * @description expose specific function rather than the AriaAutocomplete class
 * @param {Element} elem
 * @param {Object} options
 * @returns {Object}
 */
window['AriaAutocomplete'] = (elem, options) => {
    return new AriaAutocomplete(elem, options).api;
};

export default (elem, options) => {
    return new AriaAutocomplete(elem, options).api;
};
