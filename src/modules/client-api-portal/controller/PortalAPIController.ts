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

    static async updateConvenio(req: Request, res: Response, next: NextFunction) {
        console.log("Iniciando atualização do convênio");
        console.log("ID do convênio:", req.params.convenioId);
        try {
            const { convenioId } = req.params;
            const convenioEncontrado = await ConveniosService.updateConvenio(convenioId);
            console.log("Fim da atualização");
            res.status(200).json({
                message: "Convenio Atualizado",
                convenioAtualizado: convenioEncontrado
            });

        } catch (error: any) {
            HandleErrors.handleErrors(error, req, res, next);
        }
    }

}