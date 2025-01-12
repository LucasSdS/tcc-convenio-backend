export default class IfesDTO {
    code: string;
    acronym: string;
    name: string;

    constructor(code: string, acronym: string, name: string) {
        this.code = code;
        this.acronym = acronym;
        this.name = name;
    }
}