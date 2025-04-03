import { NextFunction, Request, Response } from "express";
import ConveniosService from "../service/ConveniosService";
import HandleErrors from "../../../errors/HandleErrors";

export default class PortalAPIController {

    static async updateDB(req: Request, res: Response, next: NextFunction) {
        try {
            await ConveniosService.updateAllConvenios();
            console.log("Fim da atualização");
            res.status(200).json({
                message: "Convenios e Convenentes Atualizados"
            });

        } catch (error: any) {
            HandleErrors.handleErrors(error, req, res, next);
        }
    }

}