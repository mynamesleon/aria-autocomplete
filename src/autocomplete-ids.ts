// ids used for DOM queries and accessibility attributes e.g. aria-controls
let index = 0;
export default class {
    ELEMENT: string;
    PREFIX: string;
    LIST: string;
    INPUT: string;
    BUTTON: string;
    OPTION: string;
    WRAPPER: string;
    SR_ASSISTANCE: string;
    OPTION_SELECTED: string;
    SR_ANNOUNCEMENTS: string;

    constructor(id: string) {
        index += 1;
        this.ELEMENT = id;
        this.PREFIX = `${id || ''}aria-autocomplete-${index}`;
        this.LIST = `${this.PREFIX}-list`;
        this.INPUT = `${this.PREFIX}-input`;
        this.BUTTON = `${this.PREFIX}-button`;
        this.OPTION = `${this.PREFIX}-option`;
        this.WRAPPER = `${this.PREFIX}-wrapper`;
        this.SR_ASSISTANCE = `${this.PREFIX}-sr-assistance`;
        this.OPTION_SELECTED = `${this.PREFIX}-option-selected`;
        this.SR_ANNOUNCEMENTS = `${this.PREFIX}-sr-announcements`;
    }
}
