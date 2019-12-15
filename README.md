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
    /** @description give the autocomplete a name so it will be included in form submissions */
    name: '',
    /**
     * @description string for async endpoint, array of strings, array of objects with value and label, or function
     * @type {String[]|Object[]|Function|String}
     */
    source: '',
    /** @description properties to use for label and value when using an Array of Objects as source */
    sourceMapping: {},

    /** @description input delay before running a search */
    delay: 100,
    /** @description min number of characters to run a search (includes spaces) */
    minLength: 1,
    /** @description max number of results to render */
    maxResults: 9999,
    /** @description whether to render a button that triggers showing all options */
    showAllControl: false,
    /** @description confirm selection when blurring off of the control */
    confirmOnBlur: true,

    /** @description whether to allow multiple items to be selected */
    multiple: false,
    /** @description @todo set input width to match its content */
    autoGrow: false,
    /** @description max number of items that can be selected */
    maxItems: 9999,
    /** @description if element is an input, and in multiple mode, character that separates the values */
    multipleSeparator: ',',
    /** @description if input is empty and in multiple mode, delete last selected item on backspace */
    deleteOnBackspace: false,

    /** @description when source is a string, param to use when adding input value */
    asyncQueryParam: 'q',
    /** @description when source is a string, param to use when adding results limit */
    asyncMaxResultsParam: 'limit',

    /** @description placeholder text to show in generated input */
    placeholder: 'Type to search...',
    /** @description text to show (and announce) if no results found */
    noResultsText: 'No results',
    /** @description string to prepend to all main classes for BEM naming */
    cssNameSpace: 'aria-autocomplete',
    /** @description class name to add to list */
    listClassName: '',
    /** @description class name to add to input */
    inputClassName: '',
    /** @description class name to add to component wrapper */
    wrapperClassName: '',

    /** @description in multi mode, screen reader text used for element deletion - prepended to label */
    srDeleteText: 'delete',
    /** @description in multi mode, screen reader text announced after deletion - appended to label */
    srDeletedText: 'deleted',
    /** @description screen reader text for the show all control */
    srShowAllText: 'Show all',
    /** @description screen reader text announced after selection - appended to label */
    srSelectedText: 'selected',
    /** @description screen reader explainer added to the list element via aria-label attribute */
    srListLabelText: 'Search suggestions',
    /** @description screen reader description used for main input when empty */
    srAssistiveText: 'When results are available use up and down arrows to review and enter to select. Touch device users, explore by touch or with swipe gestures.',
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
    onConfirm: undefined,
    /** @description callback after an autocomplete selection is deleted (programmatically in single-select mode, or by user action in multi-select mode) */
    onDelete: undefined,
    /** @description callback when main script processing and initial rendering has finished */
    onReady: undefined,
    /** @description callback when list area closes */
    onClose: undefined,
    /** @description callback when list area opens */
    onOpen: undefined
}
```
