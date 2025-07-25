import { NextFunction, Request, Response } from "express";
import HandleErrors from "../errors/HandleErrors";
import ConveniosService from "../services/ConveniosService";
import ConvenentesService from "../services/ConvenentesService";
import IfesService from "../services/IfesService";
import ConveniosHistoryService from "../services/ConveniosHistoryService";
import { getMostRecentDate } from "../utils/DateUtils";
import StatsDTO from "../dto/Stats";

export default class DashboardController {
    static async getDashboardStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { totalConvenios, totalConveniosActive, lastUpdatedDate } = await ConveniosService.getDashboardStats();
            const { totalConvenentes, convenentesTypes } = await ConvenentesService.getConvenentesStats();
            const totalIfes = await IfesService.getIfesStats();
            const lastUpdatedDateHistory = await ConveniosHistoryService.getLastUpdatedDate();
            const latestUpdatedDate = getMostRecentDate(lastUpdatedDate, lastUpdatedDateHistory);
            const status = new StatsDTO(totalConvenios, totalIfes, totalConveniosActive, totalConvenentes, convenentesTypes, latestUpdatedDate);
            res.status(200).json({ data: status });
        } catch (error: any) {
            HandleErrors.handleErrors(error, req, res, next);
        }
    }
}