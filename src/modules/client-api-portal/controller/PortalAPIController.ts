import { NextFunction, Request, Response } from "express";
import ConveniosService from "../service/ConveniosService";

export default class PortalAPIController {

    static async updateDB(req: Request, res: Response, next: NextFunction) {
        try {
            await ConveniosService.updateAllConvenios();
            console.log("Fim da atualização");
            res.status(200).json({
                message: "Convenios e Convenentes Atualizados"
            });

        } catch (error: any) {
            console.log(error.name, error.message);
            res.status(500).json({
                message: "Ocorreu um erro ao tentarmos atualizar os convenios, tente novamente mais tarde"
            });
        }
    }

}