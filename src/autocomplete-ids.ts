// ids used for DOM queries and accessibility attributes e.g. aria-controls
let index = 0;
export default class {
    ELEMENT: string;
    PREFIX: string;
    LIST: string;
    INPUT: string;
    LABEL: string;
    BUTTON: string;
    OPTION: string;
    WRAPPER: string;
    SR_ASSISTANCE: string;
    OPTION_SELECTED: string;
    SR_ANNOUNCEMENTS: string;

    constructor(elementId: string, labelId: string, optionId?: string) {
        index += 1;
        this.ELEMENT = elementId;
        const id = optionId || elementId || '';
        this.PREFIX = `${id}aria-autocomplete-${index}`;

        this.LIST = `${this.PREFIX}-list`;
        this.BUTTON = `${this.PREFIX}-button`;
        this.OPTION = `${this.PREFIX}-option`;
        this.WRAPPER = `${this.PREFIX}-wrapper`;
        this.LABEL = labelId || `${this.PREFIX}-label`;
        this.INPUT = optionId || `${this.PREFIX}-input`;
        this.SR_ASSISTANCE = `${this.PREFIX}-sr-assistance`;
        this.OPTION_SELECTED = `${this.PREFIX}-option-selected`;
        this.SR_ANNOUNCEMENTS = `${this.PREFIX}-sr-announcements`;
    }
}
