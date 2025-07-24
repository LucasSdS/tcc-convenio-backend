import ConvenioDTO from "../dto/Convenio";
import Convenente from "../domain/Convenente";
import Convenio from "../domain/Convenio";
import { col, fn, literal, Op, QueryTypes, Transaction } from "sequelize";
import ConvenioHistoryRepository from "./ConvenioHistoryRepository";
import Ifes from "../domain/Ifes";
import InternalServerError from "../errors/InternalServerError";
import NotFoundError from "../errors/NotFoundError";
import { logger } from "../utils/ContextLogger";
import ConvenioUIDTO from "../dto/ConvenioUIDTO";
import sequelize from "../config/postgresqlConfig";

export default class ConveniosRepository {
    private static conveniosRepositoryLogger = logger.createContextLogger("ConveniosRepositoryLog");

    static async getConvenioByNumber(conveniosNumber: string): Promise<any> {
        try {
            let findConvenioEntity = await Convenio.findOne({
                where: {
                    number: conveniosNumber
                },
                include: {
                    model: Convenente,
                    as: 'convenente'
                }
            });

            if (!findConvenioEntity) {
                throw new NotFoundError(`Erro ao tentar buscar o convenio: ${conveniosNumber}`);
            }

            const convenio = ConvenioDTO.fromEntity(findConvenioEntity);

            return convenio;
        } catch (error: any) {
            console.error(error.name, error.message);
            this.conveniosRepositoryLogger.error(
                `Erro ao tentar buscar o convênio ${conveniosNumber}. Erro: ${error.message}`,
                "ConveniosRepositoryLog"
            );
            if (error instanceof NotFoundError) {
                throw error;
            } else {
                throw new InternalServerError(`Erro ao tentar buscar o convênio ${conveniosNumber}. Tente novamente mais tarde`);
            }
        }
    }

    static async findConvenioByCode(number: string | number): Promise<Convenio | null>{
        try {
            return await Convenio.findOne({
                where: {
                    number: number
                }
            });

        }catch (error: any) {
            console.log(`Erro ao tentar buscar convenio por código ${number}`, error.name, error.message);
            this.conveniosRepositoryLogger.error(
                `Erro ao tentar buscar convenio por código ${number}. Erro: ${error.message}`, 
                "ConveniosRepositoryLog"
            );
            throw new InternalServerError(`Erro ao tentar buscar convenio por código ${number}`);
        }
    }

    static async findAllPotentiallyTruncated(): Promise<Convenio[]> {
        try {
            return await Convenio.findAll({
                where: {
                    isPotentiallyTruncated: true
                },
                order: [['createdAt', 'DESC']],
            });
        } catch (error: any) {
            console.log("Erro ao tentar buscar convenios potencialmente truncados", error.name, error.message);
            this.conveniosRepositoryLogger.error(
                `Erro ao tentar buscar convenios potencialmente truncados. Erro: ${error.message}`,
                "ConveniosRepositoryLog"
            );
            throw new InternalServerError("Erro ao tentar buscar convenios potencialmente truncados");
        }
    } 

    static async bulkCreateConveniosAndConvenentes(conveniosToCreateOrUpdate: any[], transaction: Transaction): Promise<void> {
        console.log(`Criando ${conveniosToCreateOrUpdate.length} convenios`);
        try {
            await Convenio.bulkCreate(conveniosToCreateOrUpdate, {
                transaction: transaction,
                updateOnDuplicate: [
                    'description',
                    'origin',
                    'totalValueReleased',
                    'startEffectiveDate',
                    'endEffectiveDate',
                    'lastReleaseDate',
                    'valueLastRelease',
                    'totalValue',
                    'convenenteId'
                ]
            });

        } catch (error: any) {
            console.log("Erro no BulkCreateConveniosAndConvenentes", error.name, error.message);
            throw new InternalServerError("Erro ao tentar criar convenios e convenentes");
        }
    }

    static async create(convenio: any, transaction: Transaction): Promise<Convenio | null>{
        try {
            this.conveniosRepositoryLogger.info(
                `Criando convenio: ${JSON.stringify(convenio)}`,
                "ConveniosRepositoryLog"
            );

            return await Convenio.create(convenio, { transaction });
        } catch (error: any) {
            console.log("Erro ao tentar criar convenio", error.name, error.message);
            this.conveniosRepositoryLogger.error(
                `Erro ao tentar criar convenio: ${JSON.stringify(convenio)} \nErro: ${error.message}`,
                "ConveniosRepositoryLog"
            );

            throw new InternalServerError("Erro ao tentar criar convenio");
        }
    }

    static async update(convenioToUpdate: any, oldValues: any, newValues: any, transaction: Transaction): Promise<Convenio | null> {
        try {
            this.conveniosRepositoryLogger.info(
                `Atualizando convenio: ${JSON.stringify(convenioToUpdate)} - OldValues: ${JSON.stringify(oldValues)} - newValues: ${JSON.stringify(newValues)}`,
                "ConveniosRepositoryLog"
            );

            await ConvenioHistoryRepository.saveConvenioHistory(
                convenioToUpdate.id,
                oldValues,
                newValues
            )

            this.conveniosRepositoryLogger.info(
                `Convenio atualizado com sucesso: ${JSON.stringify(convenioToUpdate)} - oldValues: ${JSON.stringify(oldValues)} - newValues: ${JSON.stringify(newValues)}`,
                "ConveniosRepositoryLog"
            );

            return await convenioToUpdate.save({ transaction });
            
        }catch (error: any){
            console.log("Erro ao tentar atualizar convenio", error.name, error.message);
            this.conveniosRepositoryLogger.error(
                `Erro ao tentar atualizar convenio: ${JSON.stringify(convenioToUpdate)} - oldValues: ${JSON.stringify(oldValues)} - newValues: ${JSON.stringify(newValues)} - \nErro: ${error.message}`,
                "ConveniosRepositoryLog"
            );

            throw new InternalServerError("Erro ao tentar atualizar convenio");
        }
    }

    static async getAll(options?: {
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
        filters?: Record<string, any>;
    }) {
        try {
            const {
                sortBy = 'lastReleaseDate',
                sortOrder = 'DESC',
                filters = {}
            } = options || {};

            const whereConditions: any = {};
            const includeConditions: any = [
                {
                    model: Convenente,
                    as: "convenente",
                    where: {}
                },
                {
                    model: Ifes,
                    as: "ifes",
                    where: {}
                }
            ];
            
            const textFields = ['description', 'origin'];
            const dateAndValueFields = ['startEffectiveDate', 'endEffectiveDate', 'lastReleaseDate', 'totalValueReleased', 'valueLastRelease', 'totalValue'];
            
            let hasIfesFilter = false;
            let hasConvenenteFilter = false;

            Object.keys(filters).forEach(key => {
                if (filters[key] && filters[key] !== '') {
                    if (textFields.includes(key)) {
                        whereConditions[key] = {
                            [Op.iLike]: `%${filters[key]}%`
                        };
                    } else if (dateAndValueFields.includes(key)) {
                        whereConditions[key] = filters[key];
                    } else if (key === 'ifesAcronym') {
                        includeConditions[1].where = {
                            acronym: {
                                [Op.iLike]: `%${filters[key]}%`
                            }
                        };
                        hasIfesFilter = true;
                    } else if (key === 'convenenteType') {
                        includeConditions[0].where = {
                            type: {
                                [Op.iLike]: `%${filters[key]}%`
                            }
                        };
                        hasConvenenteFilter = true;
                    }
                }
            });

            if (!hasIfesFilter) {
                delete includeConditions[1].where;
            }
            if (!hasConvenenteFilter) {
                delete includeConditions[0].where;
            }

            const validSortBy = ['startEffectiveDate', 'endEffectiveDate', 'lastReleaseDate', 'totalValueReleased', 'valueLastRelease', 'totalValue', 'createdAt'].includes(sortBy) ? sortBy : 'lastReleaseDate';

            const convenioEntities = await Convenio.findAll({
                where: whereConditions,
                order: [[validSortBy, sortOrder]],
                include: includeConditions
            });

            return ConvenioUIDTO.fromEntities(convenioEntities);
        } catch (error: any) {
            console.log("Ocorreu um erro ao buscar todos os convenios");
            this.conveniosRepositoryLogger.error(
                `Erro ao tentar buscar todos os convenios. Erro: ${error.message}`,
                "ConveniosRepositoryLog"
            );
            throw new InternalServerError("Erro ao tentar buscar todos os convenios. Tente novamente mais tarde");
        }
    }

    static async getAllWithPagination(options: {
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: 'ASC' | 'DESC';
        filters?: Record<string, any>;
        all?: boolean;
    }) {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = 'lastReleaseDate',
                sortOrder = 'DESC',
                filters = {},
                all = false
            } = options;

            const whereConditions: any = {};
            const includeConditions: any = [
                {
                    model: Convenente,
                    as: "convenente",
                    where: {}
                },
                {
                    model: Ifes,
                    as: "ifes",
                    where: {}
                }
            ];
            
            const textFields = ['description', 'origin'];
            const dateAndValueFields = ['startEffectiveDate', 'endEffectiveDate', 'lastReleaseDate', 'totalValueReleased', 'valueLastRelease', 'totalValue'];
            
            let hasIfesFilter = false;
            let hasConvenenteFilter = false;

            Object.keys(filters).forEach(key => {
                if (filters[key] && filters[key] !== '') {
                    if (textFields.includes(key)) {
                        whereConditions[key] = {
                            [Op.iLike]: `%${filters[key]}%`
                        };
                    } else if (dateAndValueFields.includes(key)) {
                        whereConditions[key] = filters[key];
                    } else if (key === 'ifesAcronym') {
                        includeConditions[1].where = {
                            acronym: {
                                [Op.iLike]: `%${filters[key]}%`
                            }
                        };
                        hasIfesFilter = true;
                    } else if (key === 'convenenteType') {
                        includeConditions[0].where = {
                            type: {
                                [Op.iLike]: `%${filters[key]}%`
                            }
                        };
                        hasConvenenteFilter = true;
                    }
                }
            });

            if (!hasIfesFilter) {
                delete includeConditions[1].where;
            }
            if (!hasConvenenteFilter) {
                delete includeConditions[0].where;
            }

            const validSortBy = ['startEffectiveDate', 'endEffectiveDate', 'lastReleaseDate', 'totalValueReleased', 'valueLastRelease', 'totalValue', 'createdAt'].includes(sortBy) ? sortBy : 'lastReleaseDate';

            const queryOptions: any = {
                where: whereConditions,
                order: [[validSortBy, sortOrder]],
                include: includeConditions
            };

            if (!all) {
                queryOptions.offset = (page - 1) * limit;
                queryOptions.limit = limit;
            }

            const { count, rows } = await Convenio.findAndCountAll(queryOptions);
            const conveniosUIDTO = ConvenioUIDTO.fromEntities(rows);
            
            return {
                data: conveniosUIDTO,
                totalCount: count,
                currentPage: page,
                totalPages: all ? 1 : Math.ceil(count / limit),
                limit: all ? count : limit,
                sortBy: validSortBy,
                sortOrder: sortOrder
            };
        } catch (error: any) {
            console.log("Ocorreu um erro ao buscar convenios com paginação");
            this.conveniosRepositoryLogger.error(
                `Erro ao tentar buscar convenios com paginação. Erro: ${error.message}`,
                "ConveniosRepositoryLog"
            );
            throw new InternalServerError("Erro ao tentar buscar convenios com paginação. Tente novamente mais tarde");
        }
    }

    /**
     * Método responsável por realizar a consulta de todos os convenios de uma universidade, 
     * buscando os convenios que tiveram interação no período informado.
     * 
     * Solução híbrida que combina:
     * - Período de vigência do convênio
     * - Garantia de valores liberados (elimina ruído)
     * - Interação real no período (última liberação, início ou fim no período)
     * 
     * Exemplo: Uma faculdade tem um convenio de 2020-2025 com R$ 3 milhões
     * - 2021: Liberou R$ 500k, 2022: R$ 1M, 2023: R$ 750k
     * - Consulta 2020-2021:  Vai aparecer (início em 2020 + tem valores)
     * - Consulta 2024-2025:  Vai aparecer (termina em 2025 + tem valores)
     * 
     * @param ifesCode 
     * @param dataInicio 
     * @param dataFim 
     * @returns 
     */
    static async getAllConveniosByIfesCodeAndByPeriod(ifesCode: string, dataInicio: Date, dataFim: Date): Promise<any> {
        try {
            return await Convenio.findAll(
                {
                    where: {
                        ifesCode: ifesCode,
                        startEffectiveDate: { [Op.lte]: dataFim },
                        endEffectiveDate: { [Op.gte]: dataInicio },
                        totalValueReleased: { [Op.gt]: 0 },
                        [Op.or]: [
                            { lastReleaseDate: { [Op.between]: [dataInicio, dataFim] } },
                            { startEffectiveDate: { [Op.between]: [dataInicio, dataFim] } },
                            { endEffectiveDate: { [Op.between]: [dataInicio, dataFim] } }
                        ]
                    },
                    order: [['totalValueReleased', 'DESC']],
                    include: {
                        model: Convenente,
                        as: 'convenente'
                    }
                }
            );

        } catch (error: any) {
            console.log(error.name, error.message);
            this.conveniosRepositoryLogger.error(
                `Erro ao tentar realizar a consulta para trazer todos os convênios da Ifes ${ifesCode} no período dataInicial: ${dataInicio} e dataFim: ${dataFim}. Erro: ${error.message}`,
                "ConveniosRepositoryLog"
            );
            throw new InternalServerError(`Erro ao tentar realizar a consulta para trazer todos os convênios da Ifes ${ifesCode} no período dataInicial: ${dataInicio} e dataFim: ${dataFim}. Tente novamente mais tarde`);
        }
    }

    static async getIfesRankingOptimizedRaw(startYear: Date, endYear: Date, limit: number): Promise<any> {
        try {
            const query = `
                SELECT 
                    i.code as "ifesCode",
                    i.name as "ifesName",
                    COALESCE(SUM(c."totalValueReleased"), 0) as "totalValueReleased"
                FROM "Convenios" c
                INNER JOIN "Ifes" i ON i.code = c."ifesCode"
                WHERE c."startEffectiveDate" <= :endYear
                  AND c."endEffectiveDate" >= :startYear
                  AND c."totalValueReleased" > 0
                  AND (
                    c."lastReleaseDate" BETWEEN :startYear AND :endYear 
                    OR c."startEffectiveDate" BETWEEN :startYear AND :endYear
                    OR c."endEffectiveDate" BETWEEN :startYear AND :endYear
                  )
                GROUP BY i.code, i.name
                HAVING SUM(c."totalValueReleased") > 0
                ORDER BY SUM(c."totalValueReleased") DESC
                LIMIT :limit;
            `;

            return await sequelize.query(query, {
                replacements: {
                    startYear: startYear,
                    endYear: endYear,
                    limit: limit
                },
                type: QueryTypes.SELECT
            });
        } catch (error: any) {
            console.log("Erro ao buscar ranking IFES com SQL raw");
            this.conveniosRepositoryLogger.error(
                `Erro ao buscar ranking IFES com SQL raw. Erro: ${error.message}`,
                "ConveniosRepositoryLog"
            );
            throw new InternalServerError("Erro ao buscar ranking IFES com SQL raw. Tente novamente mais tarde");
        }
    }

    static async getConvenentesRankingOptimizedRaw(startYear: Date, endYear: Date, limit: number): Promise<any> {
        try {
            const query = `
                SELECT 
                    conv.id as "convenenteId",
                    conv.name as "convenenteName", 
                    conv."detailUrl" as "convenenteDetailUrl",
                    i.code as "ifesCode",
                    i.name as "ifesName",
                    SUM(c."totalValueReleased") as "totalValueReleased"
                FROM "Convenios" c
                INNER JOIN "Convenentes" conv ON conv.id = c."convenenteId"
                INNER JOIN "Ifes" i ON i.code = c."ifesCode"
                WHERE c."startEffectiveDate" <= :endYear
                  AND c."endEffectiveDate" >= :startYear
                  AND c."totalValueReleased" > 0
                  AND (
                    c."lastReleaseDate" BETWEEN :startYear AND :endYear 
                    OR c."startEffectiveDate" BETWEEN :startYear AND :endYear
                    OR c."endEffectiveDate" BETWEEN :startYear AND :endYear
                  )
                GROUP BY conv.id, conv.name, conv."detailUrl", i.code, i.name
                HAVING SUM(c."totalValueReleased") > 0
                ORDER BY SUM(c."totalValueReleased") DESC
                LIMIT :limit;
            `;

            return await sequelize.query(query, {
                replacements: {
                    startYear: startYear,
                    endYear: endYear,
                    limit: limit
                },
                type: QueryTypes.SELECT
            });
        } catch (error: any) {
            console.log("Erro ao buscar ranking convenentes com SQL raw");
            this.conveniosRepositoryLogger.error(
                `Erro ao buscar ranking convenentes com SQL raw. Erro: ${error.message}`,
                "ConveniosRepositoryLog"
            );
            throw new InternalServerError("Erro ao buscar ranking convenentes com SQL raw. Tente novamente mais tarde");
        }
    }

    static async getConvenentesByIfesRankingRaw(ifesCodes: string[], startYear: Date, endYear: Date): Promise<any> {
        try {
            const placeholders = ifesCodes.map((_, index) => `$${index + 1}`).join(', ');
            const query = `
                SELECT 
                    i.code as "ifesCode",
                    conv.name as "convenenteName",
                    conv."detailUrl" as "convenenteDetailUrl",
                    SUM(c."totalValueReleased") as "totalValueReleased"
                FROM "Convenios" c
                INNER JOIN "Convenentes" conv ON conv.id = c."convenenteId"
                INNER JOIN "Ifes" i ON i.code = c."ifesCode"
                WHERE i.code IN (${placeholders})
                  AND c."startEffectiveDate" <= $${ifesCodes.length + 2}
                  AND c."endEffectiveDate" >= $${ifesCodes.length + 1}
                  AND c."totalValueReleased" > 0
                  AND (
                    c."lastReleaseDate" BETWEEN $${ifesCodes.length + 1} AND $${ifesCodes.length + 2}
                    OR c."startEffectiveDate" BETWEEN $${ifesCodes.length + 1} AND $${ifesCodes.length + 2}
                    OR c."endEffectiveDate" BETWEEN $${ifesCodes.length + 1} AND $${ifesCodes.length + 2}
                  )
                GROUP BY i.code, conv.name, conv."detailUrl"
                HAVING SUM(c."totalValueReleased") > 0
                ORDER BY i.code ASC, SUM(c."totalValueReleased") DESC;
            `;

            return await sequelize.query(query, {
                bind: [...ifesCodes, startYear, endYear],
                type: QueryTypes.SELECT
            });
        } catch (error: any) {
            console.log("Erro ao buscar convenentes por IFES com SQL raw");
            this.conveniosRepositoryLogger.error(
                `Erro ao buscar convenentes por IFES com SQL raw. Erro: ${error.message}`,
                "ConveniosRepositoryLog"
            );
            throw new InternalServerError("Erro ao buscar convenentes por IFES com SQL raw. Tente novamente mais tarde");
        }
    }

}