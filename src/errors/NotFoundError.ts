export default class NotFoundError extends Error {

    name: string;
    private code: Number;
    message: string;
    details: string;

    constructor(message: string, details?: string) {
        super(message);
        this.name = "NotFoundError";
        this.code = 404;
        this.details = details ?? "";
    }

}