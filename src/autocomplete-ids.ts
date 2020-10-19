// ids used for DOM queries and accessibility attributes e.g. aria-controls
let index = 0;
export default class {
    ELEMENT: string;
    LABEL: string;
    PREFIX: string;
    LIST: string;
    INPUT: string;
    BUTTON: string;
    OPTION: string;
    WRAPPER: string;
    SR_ASSISTANCE: string;
    OPTION_SELECTED: string;
    SR_ANNOUNCEMENTS: string;

    constructor(elementId: string, optionId?: string) {
        index += 1;
        this.ELEMENT = elementId;
        const id = optionId || elementId || '';
        this.PREFIX = `${id}aria-autocomplete-${index}`;

        this.LABEL = `${this.PREFIX}-label`;
        this.LIST = `${this.PREFIX}-list`;
        this.BUTTON = `${this.PREFIX}-button`;
        this.OPTION = `${this.PREFIX}-option`;
        this.WRAPPER = `${this.PREFIX}-wrapper`;
        this.INPUT = optionId || `${this.PREFIX}-input`;
        this.SR_ASSISTANCE = `${this.PREFIX}-sr-assistance`;
        this.OPTION_SELECTED = `${this.PREFIX}-option-selected`;
        this.SR_ANNOUNCEMENTS = `${this.PREFIX}-sr-announcements`;
    }
}
