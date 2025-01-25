import { NextFunction, Request, Response } from "express";
import ConveniosRepository from "../../../repositories/ConveniosRepository";
import ConveniosService from "../services/ConveniosService";

export default class ConvenioController {
    static async getConvenioByNumber(req: Request, res: Response, next: NextFunction) {
        const { conveniosNumber } = req.params;

        try {
            const convenio = await ConveniosRepository.getConvenioByNumber(conveniosNumber);
            if (!convenio) {
                throw new Error("Convenio not found");
            }

            res.status(200).json({
                convenio
            });

        } catch (error: any) {
            console.error(error.name, error.message);
            res.status(500).json({
                message: error.message
            });
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
            console.log(error.name, error.message);
            res.status(500).json({
                message: error.message
            });
        }
    }

    static async getAllConvenios(req: Request, res: Response, next: NextFunction) {
        try {
            const convenios = await ConveniosRepository.getAll();
            res.status(200).json(convenios);
        } catch (error: any) {
            console.error(error.name, error.message);
            res.status(500).json({
                message: error.message
            });
        }
    }
}