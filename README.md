# Aria Autocomplete - IN PROGRESS

Accessible, extensible, dependency-free autocomplete

I've used a lot of autocomplete plugins, but the combination of **accessibility**, **performance**, and **functionality** that I needed wasn't out there. So I've tried to build on [GOV.UK's brilliant example](https://accessibility.blog.gov.uk/2018/05/15/what-we-learned-from-getting-our-autocomplete-tested-for-accessibility/) and standards of accessibility, but with more functionality.

Key design goals and features are:

-   **multiple selection**
-   **extensible source options**: Array of Strings, Array of Objects, a Function, or an endpoint String
-   **progressive enhancement**: automatic source building through specifying a `<select>` as the element, or an element with child checkboxes.
-   **accessibility**: use of ARIA attributes, custom screen reader announcements, and testing with assistive technologies
-   **compatibility**: broad browser and device support (e.g. IE9+)

[Try out the examples](https://mynamesleon.github.io/aria-autocomplete/examples/)

Still to do:

-   `autogrow` handling
-   old IE testing

## Installation / usage

### NPM and a module system

First install it

```
npm install ...
```

Then import it, and call it on an element (ideally a text `<input />`, but not necessarily...) with a source for your autocomplete options.

```javascript
import AriaAutocomplete from '...';

new AriaAutocomplete(document.getElementById('some-element'), {
    source: ArrayOrStringOrFunction
});
```

### Plain JavaScript module

You can copy the [dist/aria-autocomplete.min.js](/mynamesleon/aria-autocomplete/blob/master/dist/aria-autocomplete.min.js) file into your project and import it into the browser:

```html
<script type="text/javascript" src="js/aria-autocomplete.min.js"></script>
```

### Styling Aria Autocomplete

I would encourage you to style it yourself to match your own site or application's design. An example stylesheet is included in the repository however at [dist/aria-autocomplete.css](/mynamesleon/aria-autocomplete/blob/master/dist/aria-autocomplete.css) which you can copy into your project and import into the browser:

```html
<link rel="stylesheet" src="css/aria-autocomplete.css" />
```

## API Documentation

At its core, the autocomplete requires only an element, and a source. When the element is an input, its value will be set using the user's selection(s). If a source isn't provided however, and the element is either a `<select>`, or is an element with child checkboxes, those will be used to build up the source.

```javascript
new AriaAutocomplete(document.getElementById('some-input'), {
    source: ['Afghanistan', 'Albania', 'Algeria', ...more]
});

const select = document.getElementById('some-select');
new AriaAutocomplete(select);

const div = document.getElementById('some-div-with-child-checkboxes');
new AriaAutocomplete(div);
```

### Options

The full list of options, and their defaults:

```javascript
{
    /**
     * @description Give the autocomplete a name to be included in form submissions
     * (Instead of using this option, I would advise initialising the autocomplete
     * on an existing input that will be submitted; this approach is compatible
     * with the control in multiple mode)
     */
    name: '',
    /**
     * @type {String | String[] | Object[] | Function}
     * @description Specify source. See examples file for more specific usage.
     * @example ['Afghanistan', 'Albania', 'Algeria', ...more]
     * @example (query: String, render: Function) => render([])
     */
    source: '',
    /**
     * @description Properties to use for label and value
     * when source is an Array of Objects
     */
    sourceMapping: { value: 'value', label: 'label' },

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
     * @description @todo Adjust input width to match its value.
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
    srAssistiveText: 'When results are available use up and down arrows to review and '
        + 'enter to select. Touch device users, explore by touch or with swipe gestures.',
    /**
     * @description Screen reader announcement after results are rendered
     */
    srResultsText: length =>
        `${length} ${length === 1 ? 'result' : 'results'} available.`,

    /**
     * @description Callback before async call is made - receives the URL.
     * Can be used to format the endpoint URL by returning a String
     */
    onAsyncPrep: url => url,
    /**
     * @description Callback after async call completes - receives the xhr object.
     * Can be used to format the results by returning an Array
     */
    onAsyncSuccess: (query, xhr) => xhr.responseText,
    /**
     * @description Callback prior to rendering - receives the options that are going
     * to render. Can be used to format the results by returning an Array
     */
    onResponse: optionsToRender => optionsToRender,
    /**
     * @description Callback before a search is performed - receives the input value.
     * Can be used to alter the search value by returning a String
     */
    onSearch: query => query,
    /**
     * @description Callback after selection is made -
     * receives an object with the option details
     */
    onConfirm: selection => {},
    /**
     * @description Callback after an autocomplete selection is deleted.
     * Fires in single-select mode when selection is deleted automatically.
     * Fires in multi-select mode when selected is deleted by user action
     */
    onDelete: selection => {},
    /**
     * @description Callback when main script processing and initial rendering has finished
     */
    onReady: componentWrapper => {},
    /**
     * @description Callback when list area closes - receives the list holder element
     */
    onClose: listElement => {},
    /**
     * @description Callback when list area opens - receives the list holder element
     */
    onOpen: listElement => {}
}
```
