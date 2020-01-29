import Autocomplete from './autocomplete';
import { API_STORAGE_PROP } from './autocomplete-constants';
import { IAriaAutocompleteOptions, IAriaAutocompleteApi } from './aria-autocomplete-types';

export function AriaAutocomplete(element: HTMLElement, options?: IAriaAutocompleteOptions): IAriaAutocompleteApi {
    // if instance already exists on the main element, do not re-initialise
    if (element && element[API_STORAGE_PROP] && element[API_STORAGE_PROP].open) {
        return element[API_STORAGE_PROP];
    }
    return new Autocomplete(element, options).api;
}

export default AriaAutocomplete;
