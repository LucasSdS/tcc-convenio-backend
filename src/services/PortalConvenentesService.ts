import { Transaction } from "sequelize";
import ConvenenteRepository from "../repositories/ConvenenteRepository";

export default class ConvenenteService {

    static async getAllConvenentesMap() {
        const convenentesPersisted = await ConvenenteRepository.getAll();
        let convenentesMap = convenentesPersisted.reduce((mapa, convenente) => mapa.set(convenente.name, convenente.id!), new Map<string, number>());
        return convenentesMap;
    }

    static async createConvenente(convenenteToPersist: any, transaction?: Transaction) {
        return await ConvenenteRepository.createConvenente(convenenteToPersist, transaction);
    }

}