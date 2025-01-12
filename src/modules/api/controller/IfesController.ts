import { NextFunction, Request, Response } from "express";
import { IfesRepository } from "../../../services/IfesService";

export default class IfesController {
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
}