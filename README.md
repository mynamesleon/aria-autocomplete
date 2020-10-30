# Aria Autocomplete

[![npm version](https://img.shields.io/npm/v/aria-autocomplete.svg)](http://npm.im/aria-autocomplete)
[![gzip size](http://img.badgesize.io/https://unpkg.com/aria-autocomplete/dist/aria-autocomplete.min.js?compression=gzip)](https://unpkg.com/aria-autocomplete/dist/aria-autocomplete.min.js)

Accessible, extensible, plain JavaScript autocomplete with multi-select.

I've used a lot of autocomplete plugins, but the combination of **accessibility**, **performance**, and **functionality** that I needed wasn't out there. So I've written this from the ground up for that purpose, building on the [brilliant accessibility of GOV.UK's accessible-autocomplete](https://accessibility.blog.gov.uk/2018/05/15/what-we-learned-from-getting-our-autocomplete-tested-for-accessibility/) - with more functionality, a smaller file size, and (in my testing) better performance.

[Try out the examples](https://mynamesleon.github.io/aria-autocomplete/)

Key design goals and features are:

-   **multiple selection**
-   **extensible source options**: Array of Strings, Array of Objects, a Function, or an endpoint String
-   **progressive enhancement**: Automatic source building through specifying a `<select>` as the element, or an element with child checkboxes.
-   **accessibility**: Use of ARIA attributes, custom screen reader announcements, and testing with assistive technologies
-   **compatibility**: Broad browser and device support (IE9+)
-   **starting values**: Automatic selection based on starting values, including for checkboxes, `select` options, and for async handling.

## Installation / usage

### NPM and a module system

First install it

```
npm install aria-autocomplete
```

Then import it, and call it on an element (ideally a text `<input />`, but not necessarily...) with a source for your autocomplete options.

```javascript
import AriaAutocomplete from 'aria-autocomplete';

AriaAutocomplete(document.getElementById('some-element'), {
    source: ArrayOrStringOrFunction,
});
```

At its core, the autocomplete requires only an element and a `source`. When the element is an input, its value will be set using the user's selection(s). If a `source` option isn't provided (is falsy, or an empty Array), and the element is either a `<select>`, or has child checkboxes, those will be used to build up the `source`.

```javascript
AriaAutocomplete(document.getElementById('some-input'), {
    source: ['Afghanistan', 'Albania', 'Algeria', ...more],
});

const select = document.getElementById('some-select');
AriaAutocomplete(select);

const div = document.getElementById('some-div-with-child-checkboxes');
AriaAutocomplete(div);
```

### Plain JavaScript module

You can grab the minified JS from the `dist` directory, or straight from unpkg:

```html
<script src="https://unpkg.com/aria-autocomplete" type="text/javascript"></script>
```

### Styling Aria Autocomplete

**I would encourage you to style it yourself** to match your own site or application's design. An example stylesheet is included in the `dist` directory however which you can copy into your project and import into the browser.

## Performance

I wrote this from the ground up largely because I needed an autocomplete with better performance than others I'd tried. I've optimised the JavaScript where I can, but in some browsers the list _rendering_ will still be a hit to performance. In my testing, modern browsers can render huge lists (1000+ items) just fine (on my laptop, averaging 40ms in Chrome, and under 20ms in Firefox).

As we all know however, Internet Explorer _sucks_. If you need to support Internet Explorer, I suggest using a sensible combination for the `delay`, `maxResults`, and possibly `minLength` options, to prevent the browser from freezing as your users type, and to reduce the rendering impact. Testing on my laptop, the list rendering in IE11 would take on average: 55ms for 250 items, 300ms for 650 items, and over 600ms for 1000 items.

## Options

The full list of options, and their defaults:

```typescript
{
    /**
     * Give the autocomplete a name to be included in form submissions
     * (Instead of using this option, I would advise initialising the autocomplete on
     * an existing input that will be submitted, to also use any existing validation;
     * this approach is also compatible with the control in multiple mode)
     */
    name: string;

    /**
     * Specify source. See examples file for more specific usage.
     * @example ['Afghanistan', 'Albania', 'Algeria', ...more]
     * @example (query, render, isFirstCall) => render(arrayToUse)
     */
    source: string[] | any[] | string | Function;

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
    confirmOnBlur: boolean = true;

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
     * Automatically clear the screen reader announcement element after the specified delay
     * Defaults to 2 seconds if true
     */
    srAutoClear: boolean | number = false;

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
     * Callback before async call is made - receives the URL, and the XHR object.
     * Can be used to format the endpoint URL by returning a String,
     * and for changes to the XHR object.
     * Note: this is before the onload and onerror functions are attached
     * and before the `open` method is called
     */
    onAsyncPrep: (url: string, xhr: XMLHttpRequest, isFirstCall: boolean) => string | void;

    /**
     * Callback before async call is sent - receives the XHR object.
     * Can be used for final changes to the XHR object, such as adding auth headers
     */
    onAsyncBeforeSend: (query: string, xhr: XMLHttpRequest, isFirstCall: boolean) => void;

    /**
     * Callback after async call succeeds, but before results render - receives the xhr object.
     * Can be used to format the results by returning an Array
     */
    onAsyncSuccess: (query: string, xhr: XMLHttpRequest, isFirstCall: boolean) => any[] | void;

    /**
     * Callback after async call completes successfully, and after the results have rendered.
     */
    onAsyncComplete: (query: string, xhr: XMLHttpRequest, isFirstCall: boolean) => void;

    /**
     * Callback if async call fails.
     */
    onAsyncError: (query: string, xhr: XMLHttpRequest, isFirstCall: boolean) => any[] | void;

    /**
     * Callback prior to rendering - receives the options that are going to render.
     * Can be used to format the results by returning an Array
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
     * Callback that fires when the selected item(s) changes
     */
    onChange: (selected: any[]) => void;

    /**
     * Callback when the overall component receives focus
     */
    onFocus: (wrapper: HTMLDivElement) => void;

    /**
     * Callback when the overall component loses focus
     */
    onBlur: (wrapper: HTMLDivElement) => void;

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
}
```

Calling `AriaAutocomplete(element, options);` returns the API object, which can also be accessed on the element via `element.ariaAutocomplete`.
