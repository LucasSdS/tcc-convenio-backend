import ConvenioDTO from "../dto/Convenio";
import Convenente from "../models/Convenente";
import Convenio from "../models/Convenio";
import { col, fn, Op, Transaction } from "sequelize";
import ConvenioHistoryRepository from "./ConvenioHistoryRepository";
import Ifes from "../models/Ifes";
import InternalServerError from "../errors/InternalServerError";
import NotFoundError from "../errors/NotFoundError";
import { logger } from "../utils/ContextLogger";

export default class ConveniosRepository {
    private static conveniosRepositoryLogger = logger.createContextLogger("ConveniosRepositoryLog");

    static async getConvenioByNumber(conveniosNumber: string): Promise<any> {
        console.log(`Buscando convenio do numero ${conveniosNumber}`);

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
            console.log(`Ocorreu um erro ao tentar buscar o convenio ${conveniosNumber}`);
            console.error(error.name, error.message);
            if (error instanceof NotFoundError) {
                throw error;
            } else {
                throw new InternalServerError(`Erro ao tentar buscar o convênio ${conveniosNumber}. Tente novamente mais tarde`);
            }
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

    static async createOrUpdate(convenioToCreateOrUpdate: any, transaction?: Transaction): Promise<any> {
        try {
            const convenioPersistido = await Convenio.findOne({
                where: {
                    number: convenioToCreateOrUpdate.number
                },
                transaction
            });

            this.conveniosRepositoryLogger.info(`Convenio vindo API: ${JSON.stringify(convenioToCreateOrUpdate)} \nConvenio já existente: ${JSON.stringify(convenioPersistido)}`, "ConveniosRepositoryLog");

            if (convenioPersistido) {
                if (convenioPersistido.totalValueReleased < convenioToCreateOrUpdate.totalValueReleased ||
                    convenioPersistido.totalValue !== convenioToCreateOrUpdate.totalValue ||
                    convenioPersistido.valueLastRelease !== convenioToCreateOrUpdate.valueLastRelease
                ) {
                    await ConvenioHistoryRepository.saveConvenioHistory(
                        convenioPersistido.id,
                        {
                            totalValueReleased: convenioPersistido.totalValueReleased,
                            totalValue: convenioPersistido.totalValue,
                            valueLastRelease: convenioPersistido.valueLastRelease
                        },
                        {
                            totalValueReleased: convenioToCreateOrUpdate.totalValueReleased,
                            totalValue: convenioToCreateOrUpdate.totalValue,
                            valueLastRelease: convenioToCreateOrUpdate.valueLastRelease
                        }
                    );
                    convenioPersistido.totalValueReleased = convenioToCreateOrUpdate.totalValueReleased;
                    convenioPersistido.valueLastRelease = convenioToCreateOrUpdate.valueLastRelease;
                    convenioPersistido.totalValue = convenioToCreateOrUpdate.totalValue;
                    convenioPersistido.lastReleaseDate = convenioToCreateOrUpdate.lastReleaseDate;
                    await convenioPersistido.save({ transaction });
                }

                return convenioPersistido;
            }

            return await Convenio.create(convenioToCreateOrUpdate, { transaction: transaction });
        } catch (error: any) {
            console.log("[DB_CONVENIOS][CONVENIOS_REPOSITORY] Erro ao tentar criar ou atualizar convenio", convenioToCreateOrUpdate.number, convenioToCreateOrUpdate.ifesCode, "Fazendo rollback");
            console.log(error.name, error.message);
            throw new InternalServerError("Erro ao tentar criar ou atualizar convenio");
        }
    }

    static async getAll() {
        console.log("Buscando todos os convenios");
        try {
            return await Convenio.findAll(
                {
                    order: [['lastReleaseDate', 'DESC']],
                    include: [
                        {
                            model: Convenente,
                            as: "convenente"
                        },
                        {
                            model: Ifes,
                            as: "ifes"
                        }
                    ],
                }
            );
        } catch (error: any) {
            console.log("Ocorreu um erro ao buscar todos os convenios");
            console.error(error.name, error.message);
            throw new InternalServerError("Erro ao tentar buscar todos os convenios. Tente novamente mais tarde");
        }
    }

    /**
     * Método responsável por realizar a consulta de todos os convenios de uma universidade, 
     * buscando os convenios que tiveram ultimos valores liberados no período informado.
     * Problemas da consulta acima: Pode não trazer valores que foram liberados anteriormente dentro do mesmo período
     * Exemplo: Uma faculdade tem um convenio com contrato de inicio de 2020 até 2025 no valor total de 3 milhões
     * No ano de 2021 a universidade repassa 500 mil, no ano de 2022 repassa 1 milhão, no ano de 2023 repassa 750 mil
     * Se o usuario colocar o periodo de comparação de 2020 até 2021 a consulta abaixo não irá encontrar o convenio acima,
     * pois a ultima data de liberação foi no ano de 2023. 
     * 
     * Método mais generalista pegando os convênios que:
     *  iniciaram dentro do período informado
     *  último dia de liberação dentro do período informado
     *  finalizaram dentro do período informado ou após período informado 
     * 
     * filtrando o campo lastReleaseDate em um período
     * e ordenando pelo valueLastRelease de forma decrescente
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
                        lastReleaseDate: { [Op.between]: [dataInicio, dataFim] }
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
            throw new InternalServerError(`Erro ao tentar realizar a consulta para trazer todos os convênios da Ifes ${ifesCode} no período dataInicial: ${dataInicio} e dataFim: ${dataFim}. Tente novamente mais tarde`);
        }
    }

    static async getIfesCodeAndTotalValueReleasedFromConvenios(startYear: Date, endYear: Date, limit: number): Promise<any> {
        try {
            return await Convenio.findAll({
                attributes: [
                    ['ifesCode', 'code'],
                    [fn('COALESCE', fn('SUM', col('totalValueReleased')), 0), 'totalValueReleased'],
                ],
                where: {
                    startEffectiveDate: { [Op.lte]: endYear },
                    endEffectiveDate: { [Op.gte]: startYear },
                    lastReleaseDate: { [Op.between]: [startYear, endYear] }
                },
                group: ['ifesCode'],
                order: [[col('totalValueReleased'), 'DESC']],
                limit: limit,
                raw: true,
            });

        } catch (error: any) {
            console.log("Erro ao tentar obter somatorio de valores totais repassados de todos os os convênios agrupados por ifesCode");
            console.log(error.name, error.message);
            throw new InternalServerError("Erro ao tentar obter somatorio de valores totais repassados de todos os os convênios agrupados por ifesCode. Tente novamente mais tarde");
        }
    }

    static async getConvenentesAndTotalValueReleasedFromConvenios(startYear: Date, endYear: Date, limit: number): Promise<any> {
        try {
            return await Convenio.findAll({
                attributes: [
                    'convenenteId',
                    [fn('SUM', col('totalValueReleased')), 'totalValueReleased'],
                    ['ifesCode', 'ifes']
                ],
                where: {
                    startEffectiveDate: { [Op.lte]: endYear },
                    endEffectiveDate: { [Op.gte]: startYear },
                    lastReleaseDate: { [Op.between]: [startYear, endYear] }
                },
                group: ['convenenteId', 'ifesCode'],
                order: [[col('totalValueReleased'), 'DESC']],
                limit: limit,
                raw: true
            });

        } catch (error: any) {
            console.log("Erro ao tentar obter o somatorio de valores totais repassados de todos os convenios agrupados por convenentes");
            console.log(error.name, error.message);
            throw new InternalServerError("Erro ao tentar obter o somatorio de valores totais repassados de todos os convenios agrupados por convenentes. Tente novamente mais tarde");
        }
    }
}