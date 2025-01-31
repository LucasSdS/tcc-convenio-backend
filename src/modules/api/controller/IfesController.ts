import { NextFunction, Request, Response } from "express";
import IfesRepository from "../../../repositories/IfesRepository";
import IfesService from "../services/IfesService";

export default class IfesController {
    static async createIfesByIfesJsonList() {
        try {
            await IfesService.createIfesOnDatabase();
        } catch (error: any) {
            console.log(error.name, error.message);
        }
    }

    static async getAllIfes(req: Request, res: Response, next: NextFunction) {
        console.log("getAllifes called");

        try {
            const allIfes = await IfesRepository.getAllIfes();
            if (!allIfes) {
                throw new Error("Ifes not found");
            }

            res.status(200).json({
                allIfes
            });

        } catch (error: any) {
            console.error(error.name, error.message);
            res.status(500).json({
                message: error.message
            });
        }

    }

    static async getIfesByCode(req: Request, res: Response, next: NextFunction) {
        console.log("getIfesByCode called");
        const { ifesCode } = req.params;

        try {
            const ifes = await IfesRepository.getIfesByCode(ifesCode);

            if (!ifes) {
                throw new Error("Ifes not found");
            }

            res.status(200).json({
                ifes
            });

        } catch (error: any) {
            console.error(error.name, error.message);
            res.status(500).json({
                message: error.message
            });
        }
    }

    static async compareIfesConvenios(req: Request, res: Response, next: NextFunction): Promise<any> {
        try {
            const ifesSelected = req.body.ifesSelected;
            const { dataInicio, dataFim } = req.query as { dataInicio: string, dataFim: string };
            const comparacaoIfesConveniosResponse = await IfesService.compareIfesConvenios(ifesSelected, dataInicio, dataFim);

            res.status(200).json({
                comparacaoIfesConveniosResponse
            });

        } catch (error: any) {
            console.log(error.name, error.message);
            res.status(500).json({
                message: error.message
            });
        }

    }
}