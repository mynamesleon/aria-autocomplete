import { IAriaAutocompleteOptions } from './aria-autocomplete-types';

export default class AutocompleteOptions {
    /**
     * Give the autocomplete a name to be included in form submissions
     * (Instead of using this option, I would advise initialising the autocomplete on
     * an existing input that will be submitted, to also use any existing validation;
     * this approach is also compatible with the control in multiple mode)
     */
    name: string;

    /**
     * Specify source options source
     * @example ['Afghanistan', 'Albania', 'Algeria', ...more]
     * @example [{ label: 'Afghanistan', value: 'AFG' }, ...more]
     * @example 'https://some-endpoint.somewhere/available'
     * @example (query, render, isFirstCall) => render(arrayToUse)
     * @example (query) => async () => arrayToUse
     */
    source: string[] | any[] | string | Function | Promise<any[]>;

    /**
     * Properties to use for label and value when source is an Array of Objects
     */
    sourceMapping: any = {};

    /**
     * Additional properties to use when searching for a match.
     * `label` will always be used
     */
    alsoSearchIn: string[] = [];

    /**
     * If no exact match is found,
     * create an entry in the options list for the current search text
     */
    create: boolean | ((value: string) => string | any | void) = false;

    /**
     * Input delay after typing before running a search
     */
    delay: number = 100;

    /**
     * Minimum number of characters to run a search (includes spaces)
     */
    minLength: number = 1;

    /**
     * Maximum number of results to render. Also used in async endpoint URL
     */
    maxResults: number = 9999;

    /**
     * Render a control that triggers showing all options.
     * Runs a search with an empty query: '', and maxResults of 9999
     */
    showAllControl: boolean = false;

    /**
     * Confirm currently active selection when blurring off of the control. If
     * no active selection, will compare current input value against available labels
     */
    confirmOnBlur: boolean | ((value: string, options: any[]) => string | void) = true;

    /**
     * Allow multiple items to be selected
     */
    multiple: boolean = false;

    /**
     * Adjust input width to match its value. This will incur a performance hit
     */
    autoGrow: boolean = false;

    /**
     * Maximum number of items that can be selected in multiple mode
     */
    maxItems: number = 9999;

    /**
     * If initialised element is an input, and in multiple mode,
     * character that separates the selected values e.g. "GLP,ZWE"
     */
    multipleSeparator: string = `,`;

    /**
     * If input is empty and in multiple mode,
     * delete last selected item on backspace
     */
    deleteOnBackspace: boolean = false;

    /**
     * In multiple mode, if more than 1 item is selected,
     * add a button at the beginning of the selected items as a shortcut to delete all
     */
    deleteAllControl: boolean = false;

    /**
     * Text to use in the deleteAllControl
     */
    deleteAllText: string = `Delete all`;

    /**
     * In async mode, parameter to use when adding the input value to the
     * endpoint String. e.g. https://some-endpoint?q=norway&limit=9999
     */
    asyncQueryParam: string = `q`;

    /**
     * In async mode, parameter to use when adding results limit to the
     * endpoint String. e.g. https://some-endpoint?q=norway&limit=9999
     */
    asyncMaxResultsParam: string = `limit`;

    /**
     * Placeholder text to show in generated input
     */
    placeholder: string;

    /**
     * Text to show (and announce to screen readers) if no results found.
     * If empty, the list of options will remain hidden when there are no results
     */
    noResultsText: string = `No results`;

    /**
     * String to prepend to classes for BEM naming
     * e.g. aria-autocomplete__input
     */
    cssNameSpace: string = `aria-autocomplete`;

    /**
     * Custom class name to add to the options list holder
     */
    listClassName: string;

    /**
     * Custom class name to add to the generated input
     */
    inputClassName: string;

    /**
     * Custom class name to add to the component wrapper
     */
    wrapperClassName: string;

    /**
     * Set the delay (in milliseconds) before screen reader announcements are made.
     * Note: if this is too short, some default announcements may interrupt it,
     * particularly with screen readers that re-announce input values after a pause in typing.
     */
    srDelay: number = 1400;

    /**
     * Automatically clear the screen reader announcement element after the specified delay
     * Number is in milliseconds. If true, defaults to 10000.
     */
    srAutoClear: boolean | number = 10000;

    /**
     * Screen reader text used in multiple mode for element deletion.
     * Prepended to option label in aria-label attribute e.g. 'delete Canada'
     */
    srDeleteText: string = `delete`;

    /**
     * Screen reader text announced after deletion.
     * Apended to option label e.g. 'Canada deleted'
     */
    srDeletedText: string = `deleted`;

    /**
     * Value for aria-label attribute on the show all control
     */
    srShowAllText: string = `Show all`;

    /**
     * Screen reader text announced after confirming a selection.
     * Appended to option label e.g. 'Canada selected'
     */
    srSelectedText: string = `selected`;

    /**
     * Screen reader explainer added to the list element via aria-label attribute
     */
    srListLabelText: string = `Search suggestions`;

    /**
     * Screen reader description announced when the input receives focus.
     * Only announced when input is empty
     */
    srAssistiveText: string =
        `When results are available use up and down arrows to review and ` +
        `enter to select. Touch device users, explore by touch or with swipe gestures.`;

    /**
     * Automatically remove the srAssistiveText once user input is detected,
     * to reduce screen reader verbosity.
     * The text is re-associated with the generated input if its value is emptied
     */
    srAssistiveTextAutoClear: boolean = true;

    /**
     * Screen reader announcement after results are rendered
     */
    srResultsText: (length: number) => string | void = (length: number) =>
        `${length} ${length === 1 ? 'result' : 'results'} available.`;

    /**
     * Callback before a search is performed - receives the input value.
     * Can be used to alter the search value by returning a String
     */
    onSearch: (value: string) => string | void;

    /**
     * Callback before async call is made - receives the URL.
     * Can be used to format the endpoint URL by returning a String
     */
    onAsyncPrep: (url: string) => string | void;

    /**
     * Callback after async call completes - receives the xhr object.
     * Can be used to format the results by returning an Array
     */
    onAsyncSuccess: (query: string, xhr: XMLHttpRequest) => any[] | void;

    /**
     * Callback if async call fails - receives the xhr object.
     */
    onAsyncError: (query: string, xhr: XMLHttpRequest) => void;

    /**
     * Callback prior to rendering - receives the options that are going
     * to render. Can be used to format the results by returning an Array
     */
    onResponse: (options: any[]) => any[] | void;

    /**
     * Callback when rendering items in the list - receives the source option.
     * Can be used to format the <li> content by returning a String
     */
    onItemRender: (sourceEntry: any) => string | void;

    /**
     * Callback after selection is made - receives an object with the option details
     */
    onConfirm: (selected: any) => void;

    /**
     * Callback after an autocomplete selection is deleted.
     * Fires in single-select mode when selection is deleted automatically.
     * Fires in multi-select mode when selected is deleted by user action
     */
    onDelete: (deleted: any) => void;

    /**
     * Callback when main script processing and initial rendering has finished
     */
    onReady: (wrapper: HTMLDivElement) => void;

    /**
     * Callback when list area closes - receives the list holder element
     */
    onClose: (list: HTMLUListElement) => void;

    /**
     * Callback when list area opens - receives the list holder element
     */
    onOpen: (list: HTMLUListElement) => void;

    /**
     * constructor
     */
    constructor(options: IAriaAutocompleteOptions = {}) {
        for (const prop in options) {
            if (options.hasOwnProperty(prop) && typeof options[prop] !== 'undefined') {
                this[prop] = options[prop];
            }
        }
    }
}
