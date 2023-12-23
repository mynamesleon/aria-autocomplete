import Autocomplete from './autocomplete';
import { IAriaAutocompleteOptions } from './aria-autocomplete-types';
import { API_STORAGE_PROP } from './autocomplete-constants';

// generate Tablist API to expose to users
export default class AutocompleteApi {
  list: HTMLUListElement;
  input: HTMLInputElement;
  wrapper: HTMLDivElement;
  options: IAriaAutocompleteOptions;
  selected: any[];

  // provide Tablist instance
  constructor(instance: Autocomplete) {
    this.list = instance.list;
    this.input = instance.input;
    this.wrapper = instance.wrapper;
    this.options = instance.options;
    this.selected = instance.selected;
    // bind to Autocomplete instance to keep it private
    this.open = this.open.bind(instance);
    this.close = this.close.bind(instance);
    this.enable = this.enable.bind(instance);
    this.disable = this.disable.bind(instance);
    this.filter = this.filter.bind(instance);
    this.setOption = this.setOption.bind(instance);
    this.destroy = this.destroy.bind(instance);
    this.delete = this.delete.bind(instance);
    this.deleteAll = this.deleteAll.bind(instance);
    // store API on the Tablist element
    instance.element[API_STORAGE_PROP] = this;
  }

  open(this: Autocomplete) {
    this.show.call(this);
  }

  close(this: Autocomplete) {
    this.hide.call(this);
  }

  enable(this: Autocomplete) {
    this.enable.call(this);
  }

  disable(this: Autocomplete, disableDeletions?: boolean) {
    this.disable.call(this, disableDeletions);
  }

  filter(this: Autocomplete, val: string) {
    this.filter.call(this, val);
  }

  setOption<K extends keyof IAriaAutocompleteOptions>(
    this: Autocomplete,
    option: K,
    value: IAriaAutocompleteOptions[K]
  ) {
    this.options[option] = value;
  }

  destroy(this: Autocomplete) {
    this.destroy.call(this);
  }

  delete(this: Autocomplete, entry?: any) {
    this.deleteEntry.call(this, this.multiple ? entry : null);
  }

  deleteAll(this: Autocomplete) {
    if (this.multiple) {
      this.deleteAllSelected.call(this);
    } else {
      this.deleteEntry.call(this);
    }
  }
}
