# Changelog

All notable changes to this project will be documented in this file.

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

[1.1.2]: https://github.com/mynamesleon/aria-autocomplete/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/mynamesleon/aria-autocomplete/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/mynamesleon/aria-autocomplete/compare/v1.0.0...v1.1.0
