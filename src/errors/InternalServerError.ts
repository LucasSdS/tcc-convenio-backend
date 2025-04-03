export default class InternalServerError extends Error {

    private code: Number
    name: string
    message: string
    details: string

    constructor(message: string, details?: string) {
        super(message);
        this.name = "InternalServerError";
        this.code = 500;
        this.details = details ?? "";
    }

    getCode(): Number {
        return this.code;
    }

}