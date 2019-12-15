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

```typescript
const source: { source: String[] | Object[] | String | Function } = {
    source: ['Afghanistan', 'Albania', 'Algeria', ...more]
};
new AriaAutocomplete(document.getElementById('some-input'), {
    source
});

const select = document.getElementById('some-select');
new AriaAutocomplete(select);

const div = document.getElementById('some-div-with-child-checkboxes');
new AriaAutocomplete(div);
```

### Options

Document options here!!
