import ConvenioDTO from "../dto/Convenio";
import Convenente from "../models/Convenente";
import Convenio from "../models/Convenio";
import ChangeLogDTO from "../dto/ChangeLog";
import ChangeLogRepository from "./ChangeLogRepository";
import { col, fn, Op, Transaction } from "sequelize";
import ConvenioHistoryRepository from "./ConvenioHistoryRepository";
import Ifes from "../models/Ifes";

export default class ConveniosRepository {

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
                throw new Error(`Convenio's number ${conveniosNumber} not found in database ERROR`);
            }

            const convenio = ConvenioDTO.fromEntity(findConvenioEntity);

            return convenio;
        } catch (error: any) {
            console.log(`Ocorreu um erro ao tentar buscar o convenio ${conveniosNumber}`);
            console.error(error.name, error.message);
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
            throw error;
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

            if (convenioPersistido) {
                const convenioDTO = ConvenioDTO.fromEntity(convenioPersistido)
                if (!ConvenioDTO.isConvenioEqual(convenioToCreateOrUpdate, convenioDTO)) {
                    const convenioDiff = ConvenioDTO.getConvenioDiff(convenioToCreateOrUpdate, convenioDTO)
                    const changeLogDTO = ChangeLogDTO.generateChangeLogDTOByDiff(convenioToCreateOrUpdate, convenioDTO, convenioDiff as Array<keyof typeof convenioDTO>)
                    ChangeLogRepository.createLogEntry(changeLogDTO)
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
                    await convenioPersistido.save({ transaction });
                }
                await convenioPersistido.update(convenioToCreateOrUpdate)
                return convenioPersistido;
            }

            return await Convenio.create(convenioToCreateOrUpdate, { transaction: transaction });
        } catch (error: any) {
            console.log("[DB_CONVENIOS][CONVENIOS_REPOSITORY] Erro ao tentar criar ou atualizar convenio", convenioToCreateOrUpdate.number, convenioToCreateOrUpdate.ifesCode, "Fazendo rollback");
            console.log(error.name, error.message);
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
            throw new Error(`Erro: Erro ao tentar realizar a consulta para trazer todos os convênios da Ifes ${ifesCode} no período dataInicial: ${dataInicio} e dataFim: ${dataFim}`);
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
            console.log("Ocorreu um erro ao obtermos o somatorio de totais repassados de todos os convenios agrupados por ifesCode");
            console.log(error.name, error.message);
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
            console.log("Ocorreu um erro ao obtermos o somatorio de totais repassados de todos os convenios agrupados por convenentes");
            console.log(error.name, error.message);
        }
    }
}