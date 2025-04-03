import { NextFunction, Request, Response } from "express";
import { messageErrors } from "./constants";
import ErrorDTO from "../dto/Error";

export default class HandleErrors {

    static handleErrors(error: any, req: Request, res: Response, next: NextFunction) {
        const code = error?.code || 500;
        const errorResponse = new ErrorDTO(
            code,
            error?.message || messageErrors.INTERNAL_SERVER_ERROR,
            error?.details || messageErrors.INTERNAL_SERVER_ERROR
        );

        console.log(`[ERROR] ${req.method} ${req.path} - Status: ${code}`);
        console.log(`Mensagem: ${error?.message}`);
        console.log(`Detalhes: ${error?.details}`);

        res.status(code).json(errorResponse);
    }

}