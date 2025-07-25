import RankingConveniosValidations from "../validations/RankingConveniosValidations";
import { buildDateOnly } from "../utils/DateUtils";
import ConveniosRepository from "../repositories/ConveniosRepository";
import IfesRankingDTO from "../dto/IfesRanking";
import ConvenentesRankingDTO from "../dto/ConvenentesRanking";
import NotFoundError from "../errors/NotFoundError";

export default class ConveniosService {
    static async getAllConvenios(options?: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
        filters?: Record<string, any>;
        all?: boolean;
    }) {
        const {
            page = 1,
            limit = 10,
            sortBy = 'lastReleaseDate',
            sortOrder = 'DESC',
            filters = {},
            all = false
        } = options || {};

        const validFilters: Record<string, any> = {};
        const allowedFilterFields = [
            'description', 'origin', 'startEffectiveDate', 'endEffectiveDate', 'lastReleaseDate', 
            'totalValueReleased', 'valueLastRelease', 'totalValue',
            'ifesAcronym', 'convenenteType'
        ];
        
        Object.keys(filters).forEach(key => {
            if (allowedFilterFields.includes(key) && filters[key] && filters[key] !== '') {
                validFilters[key] = filters[key];
            }
        });

        const sortableFields = [
            'startEffectiveDate', 'endEffectiveDate', 'lastReleaseDate', 
            'totalValueReleased', 'valueLastRelease', 'totalValue', 'createdAt'
        ];
        const validSortBy = sortableFields.includes(sortBy) ? sortBy : 'lastReleaseDate';
        const validSortOrder = (sortOrder === 'ASC' || sortOrder === 'DESC') ? sortOrder : 'DESC';

        let result;

        if (all) {
            const repositoryOptions = {
                sortBy: validSortBy,
                sortOrder: validSortOrder,
                filters: validFilters
            };

            const convenios = await ConveniosRepository.getAll(repositoryOptions);
            if (!convenios || convenios.length === 0) {
                throw new NotFoundError("Convenios não encontrados, tente novamente mais tarde", "Não foi encontrado nenhum convênio");
            }

            result = {
                data: convenios,
                metadata: {
                    totalCount: convenios.length,
                    limit: convenios.length,
                    currentPage: 1,
                    totalPages: 1,
                    sortBy: validSortBy,
                    sortOrder: validSortOrder,
                }
            };
        } else {
            const repositoryOptions = {
                page,
                limit,
                sortBy: validSortBy,
                sortOrder: validSortOrder,
                filters: validFilters,
                all: false
            };

            const repositoryResult = await ConveniosRepository.getAllWithPagination(repositoryOptions);
            if (!repositoryResult.data || repositoryResult.data.length === 0) {
                throw new NotFoundError("Convenios não encontrados, tente novamente mais tarde", "Não foi encontrado nenhum convênio");
            }

            result = {
                data: repositoryResult.data,
                metadata: {
                    totalCount: repositoryResult.totalCount,
                    limit: repositoryResult.limit,
                    currentPage: repositoryResult.currentPage,
                    totalPages: repositoryResult.totalPages,
                    sortBy: repositoryResult.sortBy,
                    sortOrder: repositoryResult.sortOrder,
                }
            };
        }

        return result;
    }

    static async getConveniosByNumber(number: string) {
        const convenio = await ConveniosRepository.getConvenioByNumber(number);
        if (!convenio) {
            throw new NotFoundError("Convenio não encontrado, tente novamente mais tarde", "Não foi encontrado nenhum convênio com este número" + number);
        }
        return convenio;
    }

    static async generateConveniosRanking(queryParams: any) {
        RankingConveniosValidations.validateData(queryParams.startYear);
        RankingConveniosValidations.validateData(queryParams.endYear);
        RankingConveniosValidations.validateLimit(queryParams.limit);

        const startYear = buildDateOnly(queryParams.startYear);
        const endYear = buildDateOnly(queryParams.endYear);
        const limit = queryParams.limit;

        const [ifesRankingRaw, convenentesRankingRaw] = await Promise.all([
            ConveniosRepository.getIfesRankingOptimizedRaw(startYear, endYear, limit),
            ConveniosRepository.getConvenentesRankingOptimizedRaw(startYear, endYear, limit)
        ]);

        const ifesCodes = ifesRankingRaw.map((ifes: any) => ifes.ifesCode);
        const convenentesByIfes = await ConveniosRepository.getConvenentesByIfesRankingRaw(ifesCodes, startYear, endYear);

        const ifesRankingDTO = ifesRankingRaw.map((ifes: any) => {
            const convenentesDestaIfes = convenentesByIfes
                .filter((conv: any) => conv.ifesCode === ifes.ifesCode)
                .map((conv: any) => ({
                    name: conv.convenenteName,
                    detailUrl: conv.convenenteDetailUrl,
                    totalValueReleased: Number(conv.totalValueReleased)
                }))
                .sort((a: any, b: any) => b.totalValueReleased - a.totalValueReleased);

            return new IfesRankingDTO({
                code: ifes.ifesCode,
                name: ifes.ifesName,
                totalValueReleased: Number(ifes.totalValueReleased),
                convenentes: convenentesDestaIfes
            });
        });

        const convenentesRankingDTO = convenentesRankingRaw.map((convenente: any) => {
            return new ConvenentesRankingDTO({
                convenenteId: convenente.convenenteId,
                name: convenente.convenenteName,
                totalValueReleased: Number(convenente.totalValueReleased),
                detailUrl: convenente.convenenteDetailUrl,
                ifes: {
                    code: convenente.ifesCode,
                    name: convenente.ifesName
                }
            });
        });

        return { ifesRankingDTO, convenentesRankingDTO };
    }

    static async getDashboardStats() {
        const [totalConvenios, totalConveniosActive, lastUpdatedDate] = await Promise.all([
            ConveniosRepository.getTotalConvenios(),
            ConveniosRepository.getTotalConveniosActive(),
            ConveniosRepository.getLatestUpdatedConveniosDate()
        ])

        return {
            totalConvenios,
            totalConveniosActive,
            lastUpdatedDate
        }
    }
}