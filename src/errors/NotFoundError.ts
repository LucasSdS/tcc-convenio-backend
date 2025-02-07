export default class NotFoundError extends Error {

    name: string;
    private code: Number;
    message: string;

    constructor(message: string) {
        super(message);
        this.name = "NotFoundError";
        this.code = 404;
    }

}