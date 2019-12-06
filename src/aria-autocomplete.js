import './closest-polyfill';
import {
    trimString,
    addClass,
    removeClass,
    cleanString,
    isPrintableKey,
    mergeObjects,
    dispatchEvent,
    setElementState,
    processSourceArray
} from './helpers';

let appIndex = 0;

const DEFAULT_OPTIONS = {
    /**
     * @description string for async endpoint, array of strings, array of objects with value and label, or function
     * @type {String|String[]|Object[]|Function}
     */
    source: '',

    /** @description input delay before running a search */
    delay: 300,
    /** @description min number of characters to run a search (includes spaces) */
    minLength: 0,
    /** @description max number of results to render */
    maxResults: 9999,
    /** @description whether to render a button that triggers showing all options */
    showAllButton: true,
    /** @description confirm selection when blurring off of the control */
    confirmOnBlur: true,

    /** @description whether to allow multiple items to be selected */
    multiple: false,
    /** @description max number of items that can be selected */
    maxItems: 9999,
    /** @description if element is an input, and in multiple mode, character that separates the values */
    multipleSeparator: ',',

    /** @description placeholder text to show in generated input */
    placeholder: 'Type to search...',
    /** @description text to show (and announce) if no results found */
    noResultsText: 'No results',

    /** @description class name to add to list */
    listClassName: '',
    /** @description class name to add to input */
    inputClassName: '',
    /** @description class name to add to component wrapper */
    wrapperClassName: 'form-control',
    /** @description string to use in front of main classes that are used */
    cssNameSpace: 'aria-autocomplete',

    /** @description when source is a string, param to use when adding input value */
    asyncQueryParam: 'q',
    /** @description when source is a string, param to use when adding results limit */
    asyncMaxResultsParam: 'limit',

    /** @description in multi mode, screen reader text used for element deletion - prepended to label */
    srDeleteText: 'delete',
    /** @description in multi mode, screen reader text announced after deletion - appended to label */
    srDeletedText: 'deleted',
    /** @description screen reader text announced after selection - appended to label */
    srSelectedText: 'selected',
    /** @description screen reader explainer added to the list element via aria-label attribute */
    srExplanatoryText: 'Search suggestions',
    /** @description screen reader description used for main input when empty */
    srAssistiveText:
        'When autocomplete results are available use up and down arrows to review and enter to select. ' +
        'Touch device users, explore by touch or with swipe gestures.',
    /** @description screen reader announcement after results are rendered */
    srResultsText: length =>
        `${length} ${length === 1 ? 'result' : 'results'} available.`,

    /** @description callback after async call completes - can be used to format the results */
    onAsyncSuccess: undefined, //  to needed format (onResponse can also be used for this)
    /** @description callback prior to rendering - can be used to format the results */
    onResponse: undefined, // before response is processed and rendered - can be used to modify results
    /** @description callback before search is performed - can be used to affect search value */
    onSearch: undefined,
    /** @description callback after selection is made */
    onSelect: undefined,
    /** @description callback when main script processing and initial rendering has finished */
    onReady: undefined,
    /** @description callback when list area closes */
    onClose: undefined,
    /** @description callback when list area opens */
    onOpen: undefined
};

class AriaAutocomplete {
    /**
     * @param {Element} element
     * @param {Object=} options
     */
    constructor(element, options) {
        // fail silently if no list provided
        if (!element) {
            return;
        }

        // if instance already exists on the list element, do not re-initialise
        if (element.ariaAutocomplete) {
            return element.ariaAutocomplete;
        }

        appIndex += 1;
        this.element = element;
        this.elementIsInput = element.nodeName === 'INPUT';
        this.elementIsSelect = element.nodeName === 'SELECT';

        // ids used for DOM queries and accessibility attributes e.g. aria-controls
        this.ids = {};
        this.ids.ELEMENT = element.id;
        this.ids.PREFIX = `${element.id || ''}aria-autocomplete-${appIndex}`;
        this.ids.LIST = `${this.ids.PREFIX}-list`;
        this.ids.INPUT = `${this.ids.PREFIX}-input`;
        this.ids.BUTTON = `${this.ids.PREFIX}-button`;
        this.ids.OPTION = `${this.ids.PREFIX}-option`;
        this.ids.WRAPPER = `${this.ids.PREFIX}-wrapper`;
        this.ids.OPTION_SELECTED = `${this.ids.OPTION}-selected`;
        this.ids.OPTION_SELECTED = `${this.ids.OPTION}-selected`;
        this.ids.SR_ASSISTANCE = `${this.ids.PREFIX}-sr-assistance`;
        this.ids.SR_ANNOUNCEMENTS = `${this.ids.PREFIX}-sr-announcements`;

        // always have an id on the original element for caching state
        if (!this.ids.ELEMENT) {
            this.ids.ELEMENT = `${this.ids.PREFIX}-element`;
            this.element.setAttribute('id', this.ids.ELEMENT);
        }

        // vars defined later - elements
        this.list;
        this.input;
        this.wrapper;
        this.showAll;
        this.srAnnouncements;

        // vars defined later - non elements
        this.xhr;
        this.term;
        this.async;
        this.source;
        this.menuOpen;
        this.multiple;
        this.selected;
        this.disabled;
        this.filtering;
        this.cssNameSpace;
        this.forceShowAll;
        this.filteredSource; // filtered source items to render
        this.currentListHtml;
        this.currentSelectedIndex; // for storing index of currently focused option

        // timers
        this.filterTimer;
        this.announcementTimer;
        this.componentBlurTimer;
        this.elementChangeEventTimer;

        this.options = mergeObjects(DEFAULT_OPTIONS, options);
        this.init();
    }

    /**
     * trigger callbacks included in component options
     * @param {String} name
     * @param {Array=} args
     */
    triggerOptionCallback(name, args) {
        if (typeof this.options[name] === 'function') {
            return this.options[name].apply(this.wrapper, args);
        }
    }

    /**
     * @description show element with CSS only - if none provided, set list state to visible
     * @param {Element=} element
     */
    show(element) {
        if (typeof element !== 'undefined') {
            let toRemove = `${this.cssNameSpace}--hide hide hidden`;
            removeClass(element, toRemove);
            return element.removeAttribute('hidden');
        }

        this.input.setAttribute('aria-expanded', 'true');
        if (this.showAll) {
            let expanded = (!!this.forceShowAll).toString();
            this.showAll.setAttribute('aria-expanded', expanded);
        }
        if (!this.menuOpen) {
            this.show(this.list);
            this.menuOpen = true;
            this.triggerOptionCallback('onOpen', [this.list]);
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
            let n = this.cssNameSpace;
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
            let n = this.cssNameSpace;
            addClass(this.input, `${n}__input--disabled disabled`);
            addClass(this.wrapper, `${n}__wrapper--disabled disabled`);
            if (this.showAll) {
                this.showAll.setAttribute('tabindex', '-1');
                addClass(this.showAll, `${n}__show-all--disabled disabled`);
            }
        }
    }

    /**
     * @description check if current input value is contained in a selection of options
     * @param {String} query - string to use - checks input value otherwise
     * @param {Array} options - array of objects with value and label properties
     * @param {String=} prop - prop to check against in options array - defaults to 'label'
     * @returns {Number} index of array entry that matches, or -1 if none found
     */
    isQueryContainedIn(query, options, prop) {
        query = trimString(query || this.input.value).toLowerCase();
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
     * @todo: implement this!
     */
    buildMultiSelected() {}

    /**
     * @description set the aria-describedby attribute on the input
     */
    setInputDescription() {
        let exists = this.input.getAttribute('aria-describedby');
        let current = trimString(exists || '');
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
        let cssName = this.cssNameSpace;
        let nodes = this.list.childNodes;
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
        let options = this.list.childNodes;
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
        let toFocus = options[index];
        if (toFocus && typeof toFocus.getAttribute('tabindex') === 'string') {
            this.currentSelectedIndex = index;
            let toAdd = `${this.cssNameSpace}__option--focused focused focus`;
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
        let valToSet = [];
        for (let i = 0, l = this.selected.length; i < l; i += 1) {
            let entry = this.selected[i];
            valToSet.push(entry.value);
            setElementState(entry.element, true, this); // element processing
        }

        // set original input value
        if (this.elementIsInput) {
            let valToSetString = valToSet.join(this.options.multipleSeparator);
            if (valToSetString !== this.element.value) {
                this.element.value = valToSetString;
                dispatchEvent(this.element, 'change');
            }
        }

        // included in case of multi-select mode used with a <select> element as the source
        if (!this.selected.length && this.elementIsSelect) {
            this.element.value = '';
        }

        // set disabled state as needed
        if (this.multiple && this.selected.length >= this.options.maxItems) {
            return this.disable();
        }
        this.enable();
    }

    /**
     * @description select option from the list by index
     * @param {Event} event
     * @param {Number} index
     * @param {Boolean} focusAfterSelection
     */
    handleOptionSelect(event, index, focusAfterSelection) {
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

        // generate new object from the selected item in case of varying original source
        /** @todo: confirm if a new object actually needs to be generated */
        let option = mergeObjects(this.filteredSource[index]);

        // detect if selected option is already in selected array
        let l = this.selected.length;
        let alreadySelected = false;
        while (l--) {
            if (this.selected[l].value === option.value) {
                alreadySelected = true;
                break;
            }
        }

        this.input.value = this.multiple ? '' : option.label;

        // reset selected array in single select mode
        if (!alreadySelected && !this.multiple) {
            this.selected = [];
        }

        // (re)set values of any DOM elements based on selected array
        if (!alreadySelected) {
            this.selected.push(option);
            this.setSourceElementValues();
            this.buildMultiSelected(option); // rebuild multi-selected if needed
        }

        this.triggerOptionCallback('onSelect', [option]);
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
        let toReturn = [];
        resultsLoop: for (let i = 0, l = results.length; i < l; i += 1) {
            let selected = this.selected;
            let result = results[i];
            for (let j = 0, k = selected.length; j < k; j += 1) {
                let labelMatch = result.label === selected[j].label;
                if (labelMatch && result.value === selected[j].value) {
                    continue resultsLoop;
                }
            }
            toReturn.push(thisResult);
        }
        return toReturn;
    }

    /**
     * @description final filtering and render for list options, and render
     * @param {Array} results
     */
    setListOptions(results) {
        let toShow = [];
        let optionId = this.ids.OPTION;
        let cssName = this.cssNameSpace;
        // if in multiple mode, exclude items already in the selected array
        let updated = this.removeSelectedFromResults(results);
        // allow callback to alter the response before rendering
        let callback = this.triggerOptionCallback('onResponse', updated);

        // now commit to setting the filtered source
        this.filteredSource = callback ? processSourceArray(callback) : updated;
        let length = this.filteredSource.length;

        // build up the list html
        let maxResults = this.options.maxResults;
        for (let i = 0; i < length && i < maxResults; i += 1) {
            toShow.push(
                `<li tabindex="-1" aria-selected="false" role="option" class="${cssName}__option" id="${optionId}--${i}" aria-posinset="${i +
                    1}" aria-setsize="${length}">${
                    this.filteredSource[i].label
                }</li>`
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
        let noText = this.options.noResultsText;
        if (!toShow.length && typeof noText === 'string' && noText.length) {
            announce = noResults;
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
        let newListHtml = toShow.join('');
        if (this.currentListHtml !== newListHtml) {
            this.currentListHtml = newListHtml;
            /** @todo: test innerHTML vs insertAdjacentHtml performance in old IE */
            this.list.innerHTML = newListHtml;
        } else {
            // if list html matches, and not re-rendered, clear aria-selected and focus classes
            this.resetOptionAttributes();
        }

        // if toShow array is empty, make sure not to render the menu
        if (!toShow.length) {
            this.hide();
            return;
        }

        this.show();
        // reset forceShowAll must be after .show()
        // aria-expanded attribute on showAllButton is controlled in .show() method
        this.forceShowAll = false;
    }

    /**
     * @description trigger async call for options to render
     * @param {String} value
     * @param {Boolean=} canCancel
     */
    handleAsync(value, canCancel = true) {
        let options = this.options;
        let xhr = new XMLHttpRequest();
        let encode = encodeURIComponent;
        let isShowAll = this.forceShowAll;
        let limit = this.selected.length + options.maxResults;
        let limitParam = `${encode(options.asyncMaxResultsParam)}=${limit}`;
        let queryParam = `${encode(options.asyncQueryParam)}=${encode(value)}`;
        let params = `${queryParam}&${limitParam}`;
        let url = this.source + (/\?/.test(this.source) ? '&' : '?') + params;

        // abort any current call first
        if (this.xhr) {
            this.xhr.abort();
        }

        xhr.open('GET', url);
        xhr.onload = () => {
            this.forceShowAll = isShowAll; // return forceShowAll to previous state before the options render
            let callback = this.triggerOptionCallback('onAsyncSuccess', [xhr]);
            let items = processSourceArray(callback || xhr.responseText, false);
            this.setListOptions(items);
        };
        xhr.send();

        // allow the creation of an uncancellable call to use on first load
        if (canCancel !== false) {
            this.xhr = xhr;
        }
    }

    /**
     * @description trigger filtering using a value
     * @param {String} value
     */
    filter(value) {
        // fail silently if no value is provided
        if (typeof value === 'undefined') {
            this.cancelFilterPrep();
            return;
        }

        let forceShowAll = this.forceShowAll;
        let callbackResponse = this.triggerOptionCallback('onSearch', [value]);
        let toReturn = [];

        // allow onSearch callback to affect the searched value
        // only permitted when not a forceShowAll case
        if (!forceShowAll && typeof callbackResponse === 'string') {
            value = callbackResponse;
        }

        // store search term - used for comparison in filterPrep
        this.term = value;

        // async handling
        if (this.async) {
            this.handleAsync(value);
            // set show all to false immediately as may be used in other places
            this.forceShowAll = false;
            return;
        }

        // handle the source as a function
        if (typeof this.source === 'function') {
            toReturn = this.source.call(this.wrapper, this.term);
            this.setListOptions(toReturn);
            return;
        }

        // if empty string, show all
        if (!value) {
            forceShowAll = true;
        }

        // existing list handling
        if (this.source && this.source.length) {
            if (!forceShowAll) {
                value = cleanString(value);
            }
            for (let i = 0, l = this.source.length; i < l; i += 1) {
                let entry = this.source[i];
                if (forceShowAll || entry.cleanedLabel.search(value) !== -1) {
                    toReturn.push({
                        element: entry.element,
                        staticSourceIndex: i,
                        label: entry.label,
                        value: entry.value
                    });
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
        let nameSpace = this.cssNameSpace;
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
        let forceShowAll = this.forceShowAll;
        let delay = forceShowAll || runNow ? 0 : this.options.delay;

        // clear timers
        this.filtering = true;
        this.cancelFilterPrep();
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

            // if value to use matches last used search term, do nothing
            let equalVals = value === this.term;

            // prevent search being run again with the same value
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
        event.preventDefault();
        this.forceShowAll = true;
        this.filterPrep(event, false, true);
    }

    /**
     * @description blur behaviour for hiding list and removing focus class(es)
     * @param {Event} event
     * @param {Boolean} force - fire instantly and force blurring out of the component
     */
    handleComponentBlur(event, force) {
        let delay = forceClose ? 0 : 100;
        if (this.componentBlurTimer) {
            clearTimeout(this.componentBlurTimer);
        }
        // use a timeout to ensure this blur fires after other focus events
        // and in case the user focuses back in immediately
        this.componentBlurTimer = setTimeout(() => {
            // do nothing if blurring to an element within the list
            let activeElem = document.activeElement;
            // exception for show all button
            /** @todo: exception for selected items */
            if (!force && !(this.showAll && this.showAll === activeElem)) {
                // must base this on the wrapper to allow scrolling the list in IE
                if (this.wrapper.contains(activeElem)) {
                    return;
                }
            }

            let isQueryIn = this.isQueryContainedIn;

            // cancel any running async call
            if (this.xhr) {
                this.xhr.abort();
            }

            // confirmOnBlur behaviour
            if (!force && this.options.confirmOnBlur && this.menuOpen) {
                // if blurring from an option (currentSelectedIndex > -1), select it
                let toUse = this.currentSelectedIndex;
                if (typeof toUse !== 'number' || toUse === -1) {
                    // otherwise check for exact match between current input value and available items
                    toUse = isQueryIn('', this.filteredSource);
                }
                this.handleOptionSelect({}, toUse, false);
            }

            let n = this.cssNameSpace;
            removeClass(this.wrapper, `${n}__wrapper--focused focused focus`);
            removeClass(this.input, `${n}__input--focused focused focus`);
            this.cancelFilterPrep();
            this.hide();

            // in single select case, if current value and chosen value differ, clear selected and input value
            if (!this.multiple && isQueryIn('', this.selected) === -1) {
                let isInputOrDdl = this.elementIsInput || this.elementIsSelect;
                if (isInputOrDdl && this.element.value !== '') {
                    this.element.value = '';
                    dispatchEvent(this.element, 'change');
                }
                this.input.value = '';
                this.selected = [];
            }
        }, delay);
    }

    /**
     * @description enter keydown for selections
     * @param {Event} event
     */
    handleEnterKey(event) {
        /** @todo: if in multiple mode, and event target was a selected item, remove it */
        if (this.multiple) {
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
            let current = this.currentSelectedIndex;
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
        let usable = !this.disabled && this.menuOpen;
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
            this.handleEnterKey(event);
        }

        if (this.disabled) {
            return;
        }

        // on backspace, if using empty input in multiple mode, delete last selected entry
        let selectedLength = this.selected && this.selected.length;
        if (
            targetIsInput &&
            this.multiple &&
            selectedLength &&
            event.keyCode === 8 &&
            this.input.value === ''
        ) {
            let lastSelectedLabel = this.selected[selectedLength - 1].label;
            let announcement = `${lastSelectedLabel} ${this.options.srDeletedText}`;
            this.announce(announcement, 0);
            this.selected.pop();
            this.buildMultiSelected();
            return;
        }

        // any printable character not on input, return focus to input
        let focusInput = !targetIsInput && isPrintableKey(event.keyCode);
        if (focusInput) {
            this.input.focus();
        }

        // trigger filtering - done here, instead of using input event, due to IE9 issues
        if (focusInput || targetIsInput) {
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
     * @description bind component events to generated elements
     */
    bindEvents() {
        // when focus is moved outside of the component, close everything
        this.wrapper.addEventListener('focusout', event => {
            this.handleComponentBlur(event, false);
        });
        // set wrapper focus state
        this.wrapper.addEventListener('focusin', event => {
            let toAdd = `${this.cssNameSpace}__wrapper--focused focused focus`;
            addClass(this.wrapper, toAdd);
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
            }
        });

        // when blurring out of input, check current value against selected one and clear if needed
        this.input.addEventListener('blur', () => {
            let toRemove = `${this.cssNameSpace}__input--focused focused focus`;
            removeClass(this.input, toRemove);
        });
        // trigger filter on input event as well as keydown (covering bases)
        this.input.addEventListener('input', event => {
            this.filterPrep(event);
        });
        // when specifically clicking on input, if menu is closed, and value is long enough, search
        this.input.addEventListener('click', event => {
            let open = this.menuOpen;
            if (!open && this.input.value.length >= this.options.minLength) {
                this.filterPrep(event, true);
            }
        });
        // when focusing on input, reset selected index and trigger search handling
        this.input.addEventListener('focusin', () => {
            let toAdd = `${this.cssNameSpace}__input--focused focused focus`;
            addClass(instance.input, toAdd);
            if (!this.disabled && !this.menuOpen) {
                instance.filterPrep(event, true);
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
                let childNodes = this.list.childNodes;
                if (childNodes.length) {
                    let nodeIndex = [].indexOf.call(childNodes, event.target);
                    this.handleOptionSelect(event, nodeIndex);
                }
            }
        });
    }

    /**
     * @description set starting source array based on child checkboxes
     */
    prepListSourceCheckboxes() {
        this.multiple = true; // force multiple in this case
        // reset source and use checkboxes
        this.source = [];
        let elements = this.element.querySelectorAll('input[type="checkbox"]');
        for (let i = 0, l = elements.length; i < l; i += 1) {
            let checkbox = elements[i];
            // must have a value other than empty string
            if (!checkbox.value) {
                continue;
            }
            toPush = { element: checkbox, value: checkbox.value };
            // label searching
            let label = checkbox.closest('label');
            if (!label && checkbox.id) {
                label = document.querySelector('[for="' + node.id + '"]');
            }
            if (label) {
                toPush.label = label.textContent;
            }
            // if no label so far, re-use value
            if (!toPush.label) {
                toPush.label = toPush.value;
            }
            toPush.cleanedLabel = cleanString(toPush.label);
            this.source.push(toPush);
            // add to selected if applicable
            if (node.checked) {
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
        let options = this.element.querySelectorAll('option');
        for (let i = 0, l = options.length; i < l; i += 1) {
            let option = options[i];
            // must have a value other than empty string
            if (!option.value) {
                continue;
            }
            let toPush = {
                element: option,
                value: option.value,
                label: option.textContent
            };
            toPush.cleanedLabel = cleanString(toPush.label);
            this.source.push(toPush);
            // add to selected if applicable
            if (node.selected) {
                this.selected.push(toPush);
            }
        }
    }

    /**
     * @description adjust starting source array to format needed, and set selected
     */
    prepListSourceArray() {
        this.source = processSourceArray(this.source);

        // build up selected array if starting element was an input, and had a value
        if (this.elementIsInput && this.element.value) {
            let value = this.element.value;

            // account for multiple mode
            let multiple = this.options.multiple;
            let separator = this.options.multipleSeparator;
            let valueArr = multiple ? value.split(separator) : [value];

            for (let i = 0, l = valueArr.length; i < l; i += 1) {
                let val = valueArr[i];
                let isQueryIn = this.isQueryContainedIn;
                // make sure it is not already in the selected array
                let isInSelected = isQueryIn(val, this.selected, 'value') > -1;

                // but is in the source array (check via 'value', not 'label')
                if (!isInSelected) {
                    let indexInSource = isQueryIn(val, this.source, 'value');
                    if (indexInSource > -1) {
                        this.selected.push(this.source[indexInSource]);
                    }
                }
            }
        }
    }

    /**
     * @description adjust set sources to needed format
     */
    prepListSource() {
        this.async = false;

        // allow complete control over the source handling via custom function
        if (typeof this.source === 'function') {
            return;
        }

        // string source - treat as async endpoint
        if (typeof this.source === 'string' && this.source.length) {
            return (this.async = true);
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
     */
    setInputStartingStates() {
        // update corresponding label to now focus on the new input
        let label = document.querySelector('[for="' + this.ids.ELEMENT + '"]');
        if (label) {
            label.ariaAutocompleteOriginalFor = this.ids.ELEMENT;
            label.setAttribute('for', this.ids.INPUT);
        }

        // update aria-describedby and aria-labelledby attributes if present
        let describedBy = this.element.getAttribute('aria-describedby');
        if (describedBy) {
            this.input.setAttribute('aria-describedby', describedBy);
        }
        let labelledBy = this.element.getAttribute('aria-labelledby');
        if (labelledBy) {
            this.input.setAttribute('aria-labelledby', labelledBy);
        }

        // if selected item(s) already exists
        if (this.selected.length) {
            // for multi select variant, set selected items
            if (this.multiple) {
                this.buildMultiSelected();
            }
            // for single select variant, set value to match
            else {
                this.input.value = this.selected[0].label || '';
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
        let o = this.options;
        let cssName = this.cssNameSpace;
        let explainerText = o.srExplanatoryText;
        let listClass = o.listClassName ? ` ${o.listClassName}` : '';
        let inputClass = o.inputClassName ? ` ${o.inputClassName}` : '';
        let wrapperClass = o.wrapperClassName ? ` ${o.wrapperClassName}` : '';
        let explainer = explainerText ? ` aria-label="${explainerText}"` : '';

        let newHtml = [
            `<div id="${this.ids.WRAPPER}" class="${cssName}__wrapper${wrapperClass}">`
        ];

        // add input
        newHtml.push(
            `<input type="text" autocomplete="off" aria-expanded="false" aria-autocomplete="list" role="combobox" id="${this.ids.INPUT}" placeholder="${this.options.placeholder} aria-owns="${this.ids.LIST}" aria-placeholder="${this.options.placeholder} class="${cssName}__input${inputClass}" />`
        );

        // button to show all available options
        if (this.options.showAll) {
            newHtml.push(
                `<span role="button" aria-label="Show all" class="${cssName}__show-all" tabindex="0" id="${this.ids.BUTTON}" aria-expanded="false"></span>`
            );
        }
        // add the list holder
        newHtml.push(
            `<ul id="${this.ids.LIST}" class="${cssName}__list${listClass}" role="listbox" hidden="hidden"${explainer}></ul>`
        );
        // add the screen reader assistance element
        newHtml.push(
            `<span class="sr-only ${cssName}__sr-only ${cssName}__sr-assistance" id="${this.ids.SR_ASSISTANCE}">${this.options.srAssistiveText}</span>`
        );
        // add element for added screen reader announcements
        newHtml.push(
            `<span class="sr-only ${cssName}__sr-only ${cssName}__sr-announcements" id="${this.ids.SR_ANNOUNCEMENTS}" aria-live="polite" aria-atomic="true"></span>`
        );

        // close all and append
        newHtml.push(`</div>`);
        this.element.insertAdjacentHTML('afterend', newHtml.join(''));
    }

    /**
     * @todo: refresh method for use after changing options, source, etc.
     */
    refresh() {
        let options = mergeObjects(this.options); // store new object from existing options
        /** @todo: soft destroy in this case */
        this.destroy();
        this.options = options;
        this.init();
    }

    /**
     * @description destroy component
     */
    destroy() {
        // return original label 'for' attribute back to element id
        let label = document.querySelector('[for="' + this.ids.INPUT + '"]');
        if (label && label.ariaAutocompleteOriginalFor) {
            label.setAttribute('for', label.ariaAutocompleteOriginalFor);
            delete label.ariaAutocompleteOriginalFor;
        }
        // remove the whole wrapper and set all instance properties to null to clean up DOMNode references
        this.element.parentNode.removeChild(this.wrapper);
        for (let i in this) {
            if (this.hasOwnProperty(i)) {
                this[i] = null;
            }
        }
        delete this.element.ariaAutocomplete;
        // re-show original element
        this.show(this.element);
    }

    /**
     * @description do it!!
     */
    init() {
        this.selected = [];

        // set these internally so that the component has to be properly refreshed to change them
        this.source = this.options.source;
        this.multiple = this.options.multiple;
        this.cssNameSpace = this.options.cssNameSpace;

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

        // hide element and list manually
        this.hide(this.list); // pass in the list so that the onClose is not triggered
        this.hide(this.element);

        // set internal source array, from static elements if necessary
        this.prepListSource();

        // set starting states for input - must be after source has been defined
        this.setInputStartingStates();

        // bind all necessary events
        this.bindEvents();

        /** @todo: handling of initial value in async case - other cases handled in setInputStartingStates */

        /** @todo: store api on original element */
        this.element.ariaAutocomplete = {};

        // fire onready callback
        this.triggerOptionCallback('onReady');
    }
}

/**
 * @description expose specific function rather than the AriaAutocomplete class
 * @param {Element} elem
 * @param {Object} options
 * @returns {Object}
 */
export default function(elem, options) {
    let autocomplete = new AriaAutocomplete(elem, options);
    return autocomplete.api;
}
