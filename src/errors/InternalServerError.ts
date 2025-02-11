export default class InternalServerError extends Error {

    private code: Number
    name: string
    message: string

    constructor(message: string) {
        super(message);
        this.code = 500;
        this.name = "InternalServerError";
    }

    getCode(): Number {
        return this.code;
    }

}