export default class BadRequestError extends Error {

    name: string;
    private code: Number;
    message: string;

    constructor(message: string) {
        super(message);
        this.name = "BadRequestError";
        this.code = 400;
    }

}