import { ConveniosRepository } from "../../../services/ConvenioService";
import { NextFunction, Request, Response } from "express";
import PortalAPI from "../service/ClientPortalAPI";
import ConvenioDTO from "../../../dto/Convenio";
import axios from "axios";

export default class PortalAPIController {
    static async getConvenio(req: Request, res: Response, next: NextFunction): Promise<void> {
        console.log("getConvenio executado!");

        // TODO: Validar os campos de req.ifescode e req.year       
        try {
            const { ifescode, year } = req.params as { ifescode: string, year: string };

            const response = await PortalAPI.call(ifescode, year, 1);

            if (response) {
                response.forEach(async (convenio: ConvenioDTO) => {
                    const persisted = await ConveniosRepository.getConvenioByNumber(convenio.number);

                    if (!persisted) {
                        await ConveniosRepository.createConvenio(convenio);
                    }
                });
            }

            res.status(200).json({
                message: "Portal API Controller called succesfully",
                params: req.params,
                portalAPIResponse: response
            });

        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                res.status(error.response?.status || 500).json({
                    message: "Erro ao tentar consumir API do Portal da Transparencia",
                    error: error.message,
                    name: error.name
                });
            } else {
                res.status(500).json({
                    message: "Ocorreu um erro inesperado no servidor",
                    error: error.mesage,
                    name: error.name
                });
            }
        }
    }

    static async updateDB(req: Request, res: Response, next: NextFunction) {
        const response = await PortalAPI.updateAllConvenios();

        res.status(200).json({
            list: response
        });
    }

}