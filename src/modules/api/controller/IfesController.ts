import { NextFunction, Request, Response } from "express";
import IfesService from "../services/IfesService";
import HandleErrors from "../../../errors/HandleErrors";

export default class IfesController {
    static async createIfesByIfesJsonList() {
        try {
            await IfesService.createIfesOnDatabase();
        } catch (error: any) {
            console.log(`Ocorreu um erro ao tentar criar as Ifes no banco de dados`);
            console.log(error.name, error.message);
        }
    }

    static async getAllIfes(req: Request, res: Response, next: NextFunction) {
        try {
            const allIfes = await IfesService.getAllIfes();
            res.status(200).json({ allIfes });
        } catch (error: any) {
            HandleErrors.handleErrors(error, req, res, next);
        }

    }

    static async getIfesByCode(req: Request, res: Response, next: NextFunction) {
        console.log("getIfesByCode called");
        const { ifesCode } = req.params;

        try {
            const ifes = await IfesService.getIfesByCode(ifesCode);
            res.status(200).json({ ifes });
        } catch (error: any) {
            HandleErrors.handleErrors(error, req, res, next);
        }
    }

    static async compareIfesConvenios(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const ifesSelected = req.body.ifesSelected;
            const { dataInicio, dataFim } = req.query as { dataInicio: string, dataFim: string };
            const comparacaoIfesConveniosResponse = await IfesService.compareIfesConvenios(ifesSelected, dataInicio, dataFim);

            res.status(200).json({ comparacaoIfesConveniosResponse });

        } catch (error: any) {
            console.log(error.name, error.message);
            HandleErrors.handleErrors(error, req, res, next);
        }

    }
}