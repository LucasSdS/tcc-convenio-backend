import { NextFunction, Request, Response } from "express";
import { messageErrors } from "./constants";

export default class HandleErrors {

    static handleErrors(error: any, req: Request, res: Response, next: NextFunction) {
        const code = error?.code || 500;
        res.status(code).json({
            message: error.message || messageErrors.INTERNAL_SERVER_ERROR,
        });
    }

}