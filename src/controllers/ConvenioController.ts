import { NextFunction, Request, Response } from "express";
import ConveniosService from "../services/ConveniosService";
import HandleErrors from "../errors/HandleErrors";
import UrlUtils from "../utils/UrlUtils";

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

        try {
            const rankingConveniosResponse = await ConveniosService.generateConveniosRanking(queryParams);
            res.status(200).json(rankingConveniosResponse);

        } catch (error: any) {
            HandleErrors.handleErrors(error, req, res, next);
        }
    }

    static async getAllConvenios(req: Request, res: Response, next: NextFunction) {
        try {
            let { page = 1, limit = 10, sortBy = 'lastReleaseDate', sortOrder = 'DESC', all = false, ...filters } = req.query;
            
            const pageNumber = parseInt(page as string);
            const limitNumber = parseInt(limit as string);
            const allBoolean = (all as string) === 'true';
            
            const decodedFilters = UrlUtils.decodeQueryParams(filters);
            const cleanFilters = UrlUtils.sanitizeFilters(decodedFilters);
            
            const options = {
                page: pageNumber,
                limit: limitNumber,
                sortBy: sortBy as string,
                sortOrder: (sortOrder as string).toUpperCase() as 'ASC' | 'DESC',
                filters: cleanFilters,
                all: allBoolean
            };

            const result = await ConveniosService.getAllConvenios(options);
            res.status(200).json(result);
            
        } catch (error: any) {
            HandleErrors.handleErrors(error, req, res, next);
        }
    }
}