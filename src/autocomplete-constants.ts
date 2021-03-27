export const API_STORAGE_PROP: string = 'ariaAutocomplete';
export const CLEANED_LABEL_PROP: string = '_ariaAutocompleteCleanedLabel';
export const SELECTED_OPTION_PROP: string = '_ariaAutocompleteSelectedOption';
export const ORIGINALLY_LABEL_FOR_PROP: string = '_ariaAutocompleteLabelOriginallyFor';

export const KEYCODES = {
    BACKSPACE: 8,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    PAGEUP: 33,
    PAGEDOWN: 34,
    END: 35,
    HOME: 36,
    UP: 38,
    DOWN: 40,
    DELETE: 46,
};

export const UNESCAPED_HTML_REGEX = /[&<>"']/g;
export const HTML_REPLACEMENTS = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
};
