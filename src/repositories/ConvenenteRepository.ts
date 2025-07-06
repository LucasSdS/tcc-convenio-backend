import { Transaction } from "sequelize";
import sequelize from "../config/postgresqlConfig";
import ConvenenteDTO from "../dto/Convenente";
import Convenente from "../domain/Convenente";
import { Op } from "sequelize";
import Convenio from "../domain/Convenio";
import Ifes from "../domain/Ifes";
import InternalServerError from "../errors/InternalServerError";

export default class ConvenenteRepository {

    static async getById(id: number) {
        try {
            return await Convenente.findByPk(id);
        } catch (error: any) {
            console.log(error.name, error.message);
            throw new InternalServerError("Erro ao tentar buscar convenente pelo id. Tente novamente mais tarde");
        }
    }

    static async getAll() {
        try {
            return await Convenente.findAll();
        } catch (error: any) {
            console.log(error.name, error.message);
            throw new InternalServerError("Erro ao tentar buscar todos os convenentes. Tente novamente mais tarde");
        }
    }

    static async findByDetailUrlList(convenenteUrls: any[]) {
        let transaction = await sequelize.transaction();
        try {
            return await Convenente.findAll({
                where: {
                    detailUrl: convenenteUrls
                }
            });

        } catch (error: any) {
            transaction.rollback();
            console.log(error.name, error.message);
            throw new InternalServerError(`Erro ao tentar buscar todos os convenentes com url: ${convenenteUrls}`);
        }
    }

    static async bulkCreateConvenentes(convenentesToCreate: any[], transaction: Transaction) {
        try {
            const newConvenentes = await Convenente.bulkCreate(convenentesToCreate, { transaction: transaction, returning: true });
            return newConvenentes;

        } catch (error: any) {
            console.log("Erro no bulkCreateConvenentes", error.name, error.message);
            throw new InternalServerError("Erro ao tentar criar todos os convenentes de uma vez. Tente novamente mais tarde");
        }

    }

    static async createConvenente(convenente: ConvenenteDTO, transaction?: Transaction): Promise<any> {
        try {
            return await Convenente.create(convenente, { transaction: transaction });
        } catch (error: any) {
            console.log("[DB_CONVENENTES][CONVENENTES_REPOSITORY] Erro ao criar/buscar Convenente", convenente.name);
            console.log(error.name, error.message);
            throw new InternalServerError(`Erro ao tentar criar o convenente ${convenente.name}`);
        }
    }

    static async getAllConvenentesWithTotalValueReleasedsConvenios(convenentesRankingId: any[], convenentesIfesCode: any[], startYear: Date, endYear: Date) {
        try {
            return await Convenente.findAll({
                where: { id: { [Op.in]: convenentesRankingId } },
                include: [
                    {
                        model: Convenio,
                        as: 'convenios',
                        attributes: ['ifesCode'],
                        where: {
                            startEffectiveDate: { [Op.lte]: endYear },
                            endEffectiveDate: { [Op.gte]: startYear },
                            lastReleaseDate: { [Op.between]: [startYear, endYear] },
                            convenenteId: { [Op.in]: convenentesRankingId }
                        },
                        include: [{ model: Ifes, as: 'ifes', where: { code: { [Op.in]: convenentesIfesCode } }, attributes: ['name'] }]
                    }
                ]
            });


        } catch (error: any) {
            console.error("Erro ao buscar Ifes com mais repasses realizados:", error);
            throw new InternalServerError("Erro ao tentar buscar Ifes com mais repasses realizados. Tente novamente mais tarde");
        }
    }

}