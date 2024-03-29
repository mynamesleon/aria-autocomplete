export interface IAriaAutocompleteOptions {
    id?: string;
    name?: string;
    source?: string | string[] | any[] | Function | Promise<any[]>;
    sourceMapping?: any;
    alsoSearchIn?: string[];
    create?: boolean | ((value: string) => string | any | void);
    delay?: number;
    minLength?: number;
    maxResults?: number;
    showAllControl?: boolean;
    confirmOnBlur?: boolean | ((value: string, results: any[]) => string | void);
    multiple?: boolean;
    autoGrow?: boolean;
    maxItems?: number;
    multipleSeparator?: string;
    deleteOnBackspace?: boolean;
    deleteAllControl?: boolean;
    deleteAllText?: string;
    asyncQueryParam?: string;
    asyncMaxResultsParam?: string;
    placeholder?: string;
    noResultsText?: string;
    cssNameSpace?: string;
    listClassName?: string;
    inputClassName?: string;
    wrapperClassName?: string;
    srDelay?: number;
    srAutoClear?: boolean | number;
    srDeleteText?: string;
    srDeletedText?: string;
    srShowAllText?: string;
    srSelectedText?: string;
    srListLabelText?: string;
    srAssistiveText?: string;
    srAssistiveTextAutoClear?: boolean;
    srResultsText?(length: number): string | void;
    onSearch?(value: string): string | void;
    onAsyncPrep?(url: string, xhr: XMLHttpRequest, isFirstCall: boolean): string | void;
    onAsyncBeforeSend?(query: string, xhr: XMLHttpRequest, isFirstCall: boolean): void;
    onAsyncSuccess?(query: string, xhr: XMLHttpRequest, isFirstCall: boolean): any[] | void;
    onAsyncComplete?(query: string, xhr: XMLHttpRequest, isFirstCall: boolean): void;
    onAsyncError?(query: string, xhr: XMLHttpRequest, isFirstCall: boolean): void;
    onResponse?(options: any[]): any[] | void;
    onItemRender?(sourceEntry: any): string | void;
    onConfirm?(selected: any): void;
    onDelete?(deleted: any): void;
    onChange?(selected: any[]): void;
    onFocus?(wrapper: HTMLDivElement): void;
    onBlur?(wrapper: HTMLDivElement): void;
    onReady?(wrapper: HTMLDivElement): void;
    onClose?(list: HTMLUListElement): void;
    onOpen?(list: HTMLUListElement): void;
}

export interface IAriaAutocompleteApi {
    list: HTMLUListElement;
    input: HTMLInputElement;
    wrapper: HTMLDivElement;
    options: IAriaAutocompleteOptions;
    selected: any[];
    open(): void;
    close(): void;
    enable(): void;
    disable(disableDeletions?: boolean): void;
    filter(value: string): void;
    setOption<K extends keyof IAriaAutocompleteOptions>(
        option: K,
        value: IAriaAutocompleteOptions[K]
    ): void;
    delete(entry?: any): void;
    deleteAll(): void;
    destroy(): void;
}

declare function AriaAutocomplete(element: HTMLElement, options?: IAriaAutocompleteOptions): IAriaAutocompleteApi;
export default AriaAutocomplete;
