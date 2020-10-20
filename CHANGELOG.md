# Changelog

All notable changes to this project will be documented in this file.

## [1.3.0] - 2020-xx-xx

### Added

-   Add `keepUserInput` option. Keep user input even if there are no results.

### Fixed

-   Accessibility issues :
    -   focus was lost after deletion of a selected item : return on the input.
    -   aria-describedby for the suggestions list.
    -   screenreader texts as p instead of span.
    -   `sr-assistance` hidden with display none.
    -   `sr-announcements` emptied 2s after each announcement.

## [1.2.0] - 2020-10-01

### Added

-   `onChange` callback option that fires when the selected item(s) changes, and provides all selections in an array as an argument.
-   `onFocus` callback option that fires when the overall component gains focus, and receives the component wrapper as an argument.
-   `onBlur` callback option that fires when the overall component loses focus, and receives the component wrapper as an argument.
-   `id` option to set a specific ID on the generated input
-   the function usage of the `source` option can now take a Promise which resolves with the items to render, instead of having to use the provided second argument callback
-   `onAsyncBeforeSend` callback option, to allow adjustments to the xhr object before it is sent (e.g. adding auth headers)

### Fixed

-   The `name` option now works correctly.
-   In certain cases, the change event fired on the original input before the API's `selected` array was updated.
-   Added a workaround for an IE11 bug where the options were shown on load if the `minLength` was set to 0 on a multi-select autocomplete with starting values. This was due to the input's placeholder being removed, which erroneously triggers the `input` event in IE11.
-   Edge case errors when destroying the component immediately after certain actions (such as selecting an item, or blurring off of the component).

## [1.1.4] - 2020-07-05

### Fixed

-   TypeScript definitions not included in npm package

## [1.1.3] - 2020-02-04

### Fixed

-   Issue where hitting the enter key after running a search with a value prevented the down arrow from moving focus to the first item in the results. Thanks to /u/holloway on reddit for discovering this.

## [1.1.2] - 2020-01-31

### Fixed

-   Issue with autoGrow not triggering after deleting an item in multiple mode when the placeholder is re-added to the input

## [1.1.1] - 2020-01-29

### Fixed

-   Issue where `hide` related classes were incorrectly being added to a `select` element's children, instead of to the `select`, due to a dependency issue

## [1.1.0] - 2020-01-29

### Added

-   Home key usage to go to first item in the list
-   End key usage to go to last item in the list
-   `onAsyncError` callback option

### Changed

-   Moved code and build over to TypeScript for: code improvements, self-documentation, and reduced bundle size by using an ES6 output from TypeScript that's bundled to UMD with webpack.

### Fixed

-   Issue with the API filter method getting an error
-   Issue when clicking on a single-select autocomplete with minLength of 0 with a current selection, which was correctly searching with an empty string, but the polling method was then triggering a search with the value afterwards.
-   Screen reader announcements for results ignoring the number of results rendered

[1.1.3]: https://github.com/mynamesleon/aria-autocomplete/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/mynamesleon/aria-autocomplete/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/mynamesleon/aria-autocomplete/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/mynamesleon/aria-autocomplete/compare/v1.0.0...v1.1.0
