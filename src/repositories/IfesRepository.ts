import Ifes from "../models/Ifes";
import IfesDTO from "../dto/Ifes";
import sequelize from "../../database/postgresqlConfig";
import Convenio from "../models/Convenio";
import { Op } from "sequelize";
import Convenente from "../models/Convenente";

export default class IfesRepository {
    static async getAllIfes(): Promise<IfesDTO[]> {
        console.log(`Buscando todas as Ifes da tabela`);
        try {
            const allIfesQuery = await Ifes.findAll();
            if (allIfesQuery) {
                return allIfesQuery.map(({ dataValues }) => {
                    return new IfesDTO(dataValues.code, dataValues.acronym, dataValues.name);
                });
            } else {
                return [];
            }

        } catch (error: any) {
            console.log("Ocorreu um erro ao buscar todas Ifes");
            console.error(error.name, error.message);
            throw error;
        }
    }

    static async getIfesByCode(ifesCode: string): Promise<IfesDTO> {
        console.log(`Buscando Ifes com código: ${ifesCode}`);
        try {
            let findIfesEntity = await Ifes.findOne({
                where: {
                    code: ifesCode
                }
            });

            if (!findIfesEntity) {
                throw new Error(`Ifes's code ${ifesCode} not found in database ERROR`);
            }

            const { code, acronym, name } = findIfesEntity.dataValues as { code: string, acronym: string, name: string };
            return new IfesDTO(code, acronym, name);

        } catch (error: any) {
            console.log(`Ocorreu um erro ao tentar buscar a Ifes ${ifesCode}`);
            console.error(error.name, error.message);
            throw error
        }

    }

    static async updateIfes(ifes: IfesDTO): Promise<void> {
        try {
            let findIfes = await Ifes.findOne({
                where: {
                    acronym: ifes.acronym,
                    name: ifes.name
                }
            });

            if (findIfes) {
                findIfes.code = ifes.code;
                findIfes.save();
            } else {
                throw new Error(`Ifes ${ifes.name} not found in database ERROR`);
            }

        } catch (error: any) {
            console.log("Ocorreu um erro ao atualizar Ifes", ifes.name);
            console.error(error.name, error.message);
            throw error;
        }
    }


    static async bulkCreateIfes(ifesList: IfesDTO[]): Promise<void> {
        const transaction = await sequelize.transaction();
        try {
            await Ifes.bulkCreate(ifesList, { transaction: transaction });
            await transaction.commit();
        } catch (error: any) {
            await transaction.rollback();
            console.log(error.name, error.message);
        }
    }

    static async getAllIfesWithTotalValueReleasedsConvenios(ifesRankingCode: any[], startYear: Date, endYear: Date) {
        try {
            return await Ifes.findAll({
                where: {
                    code: { [Op.in]: ifesRankingCode },
                },
                attributes: ['code', 'name'],
                include: [{
                    model: Convenio,
                    as: 'convenios',
                    attributes: ['totalValueReleased', 'convenenteId'],
                    where: {
                        startEffectiveDate: { [Op.lte]: endYear },
                        endEffectiveDate: { [Op.gte]: startYear },
                        lastReleaseDate: { [Op.between]: [startYear, endYear] }
                    },
                    required: false,
                    include: [
                        {
                            model: Convenente,
                            as: 'convenente',
                            attributes: ['name', 'detailUrl']
                        }
                    ]
                }],
            });


        } catch (error: any) {
            console.error("Erro ao buscar Ifes com mais repasses realizados:", error);
            if (error.name === 'SequelizeDatabaseError') {
                console.error("SQL gerado:", error.parent?.sql);
            }
            return [];
        }
    }

}