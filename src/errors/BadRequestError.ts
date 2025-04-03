export default class BadRequestError extends Error {

    name: string;
    private code: Number;
    message: string;
    details: string

    constructor(message: string, details?: string) {
        super(message);
        this.name = "BadRequestError";
        this.code = 400;
        this.details = details ?? "";
    }

}