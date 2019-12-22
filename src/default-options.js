export default {
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
     * @description Callback before a search is performed - receives the input value.
     * Can be used to alter the search value by returning a String
     */
    onSearch: undefined,
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
     * @description Callback when rendering items in the list.
     * Can be used to format the <li> content by returning a String
     */
    onItemRender: undefined,
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
