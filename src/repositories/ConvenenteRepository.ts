import { Transaction } from "sequelize";
import sequelize from "../../database/postgresqlConfig";
import ConvenenteDTO from "../dto/Convenente";
import Convenente from "../models/Convenente";

export default class ConvenenteRepository {

    static async getById(id: number) {
        try {
            return await Convenente.findByPk(id);
        } catch (error: any) {
            console.log(error.name, error.message);
            throw error;
        }
    }

    static async getAll() {
        try {
            return await Convenente.findAll();
        } catch (error: any) {
            console.log(error.name, error.message);
            throw error;
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
            throw error;
        }
    }

    static async bulkCreateConvenentes(convenentesToCreate: any[], transaction: Transaction) {
        try {
            const newConvenentes = await Convenente.bulkCreate(convenentesToCreate, { transaction: transaction, returning: true });
            return newConvenentes;

        } catch (error: any) {
            console.log("Erro no bulkCreateConvenentes", error.name, error.message);
            throw error;
        }

    }

    static async createConvenente(convenente: ConvenenteDTO, transaction?: Transaction): Promise<any> {
        try {
            return await Convenente.create(convenente, { transaction: transaction });
        } catch (error: any) {
            console.log("[DB_CONVENENTES][CONVENENTES_REPOSITORY] Erro ao criar/buscar Convenente", convenente.name);
            console.log(error.name, error.message);
        }
    }

}