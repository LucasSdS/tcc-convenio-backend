import { NextFunction, Request, Response } from "express";
import ConveniosService from "../services/ConveniosService";
import HandleErrors from "../errors/HandleErrors";

export default class ConvenioController {
    static async getConvenioByNumber(req: Request, res: Response, next: NextFunction) {
        const { conveniosNumber } = req.params;

        try {
            const convenio = ConveniosService.getConveniosByNumber(conveniosNumber);
            res.status(200).json({ convenio });

        } catch (error: any) {
            HandleErrors.handleErrors(error, req, res, next);
        }
    }

    static async rankingConvenios(req: Request, res: Response, next: NextFunction) {
        const queryParams = {
            startYear: req.query?.startYear,
            endYear: req.query?.endYear,
            limit: req.query?.limit
        }

        console.log("Executando rankingConvenios", queryParams);
        try {
            const rankingConveniosResponse = await ConveniosService.generateConveniosRanking(queryParams);
            console.log("Ranking Convenios finalizado com sucesso");
            res.status(200).json(rankingConveniosResponse);

        } catch (error: any) {
            HandleErrors.handleErrors(error, req, res, next);
        }
    }

    static async getAllConvenios(req: Request, res: Response, next: NextFunction) {
        try {
            const convenios = await ConveniosService.getAllConvenios();
            res.status(200).json(convenios);
        } catch (error: any) {
            HandleErrors.handleErrors(error, req, res, next);
        }
    }
}