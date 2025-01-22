import { Transaction } from "sequelize";
import sequelize from "../../../../database/postgresqlConfig";
import ConvenioDTO from "../../../dto/Convenio";
import ConvenenteRepository from "../../../repositories/ConvenenteRepository";
import ConveniosRepository from "../../../repositories/ConveniosRepository";
import IfesRepository from "../../../repositories/IfesRepository";
import PortalAPI from "./ClientPortalAPI";
import ConvenenteService from "./ConvenenteService";

const BATCH_SIZE = 50;

export default class ConveniosService {

    static async updateAllConvenios() {
        const ifesList = await IfesRepository.getAllIfes();
        await Promise.all(ifesList.map(async (ifes) => {
            const resDTO = await this.getAllConvenios(ifes.code)
            const conveniosDTO = resDTO.flat();
            await this.createOrUpdateConveniosAndConvenentes(conveniosDTO);
        }));
    }

    static async getAllConvenios(ifesCode: string): Promise<ConvenioDTO[]> {
        const conveniosToCreate: ConvenioDTO[] = [];
        const resDTO: ConvenioDTO[][] = [];
        let currYear = new Date().getFullYear();
        let cycleYear = true;
        while (cycleYear) {
            let page = 1;
            let response = await PortalAPI.call(ifesCode, currYear.toString(), page);
            if (response.length) {
                resDTO.push(response);
            }
            while (response.length) {
                page++;
                response = await PortalAPI.call(ifesCode, currYear.toString(), page);
                if (response.length) {
                    resDTO.push(response);
                }
            }
            // if (!response.length && page === 1) cycleYear = false
            if (currYear < 2024) cycleYear = false
            currYear--;
        }
        return resDTO.flat();
    }

    static async createOrUpdateConveniosAndConvenentes(conveniosDTO: ConvenioDTO[]) {
        let convenentesMap = await ConvenenteService.getAllConvenentesMap();
        const conveniosToCreate: ConvenioDTO[] = []

        for (const convenioDTO of conveniosDTO) {
            const transaction = await sequelize.transaction();
            const convenenteExiste = convenentesMap.has(convenioDTO.convenente.name);

            try {
                let convenenteId;
                if (convenenteExiste) {
                    convenenteId = convenentesMap.get(convenioDTO.convenente.name);
                } else {
                    const convenentePersisted = await ConvenenteService.createConvenente(convenioDTO.convenente, transaction);
                    convenenteId = convenentePersisted.id;
                    convenentesMap.set(convenentePersisted.name, convenentePersisted.id);
                }

                const convenioToPersist = convenioDTO.toEntity(convenenteId);
                await ConveniosService.createConvenio(convenioToPersist, transaction);

                await transaction.commit();
            } catch (error: any) {
                console.log("[CONVENIOS_SERVICE] Erro ao tentar criar convenio e convenente");
                console.log(error.name, error.message);
                await transaction.rollback();
            }
        }
    }

    static async createConvenio(convenioToPersist: any, transaction?: Transaction) {
        try {
            const convenioPersistedOrUpdated = await ConveniosRepository.createOrUpdate(convenioToPersist, transaction);
            console.log("Convenio: ", convenioPersistedOrUpdated.ifesCode, convenioPersistedOrUpdated.number, convenioPersistedOrUpdated.id, " Criado ou Atualizado com sucesso");
        } catch (error: any) {
            console.log(error.name, error.message);
            throw error;
        }
    }

    // Forma Em estudo utilizando BULKs para criação de convenios e convenentes
    static async bulkCreateOrUpdateConveniosAndConvenentes(conveniosDTO: ConvenioDTO[]) {
        const transaction = await sequelize.transaction();
        try {
            console.log("Iniciando createOrUpdateConveniosAndConvenentes");
            // console.log("conveniosDTO", conveniosDTO);
            const convenenteUrls = [...new Set(conveniosDTO.map(dto => dto.convenente.detailUrl))];
            // console.log("convenenteUrls", convenenteUrls);

            const existingConvenentes = await ConvenenteRepository.findByDetailUrlList(convenenteUrls);
            // console.log("existingConvenentes", existingConvenentes);

            const convenentesMap = Object.fromEntries(existingConvenentes.map(convenente => [convenente.detailUrl, convenente]));
            // console.log("convenentesMap", convenentesMap);

            const convenentesToCreate = conveniosDTO
                .filter(convenioDTO => !convenentesMap[convenioDTO.convenente.detailUrl])
                .map(convenioDTO => convenioDTO.convenente.toEntity());

            // console.log("convenentesToCreate", convenentesToCreate);

            for (let i = 0; i < convenentesToCreate.length; i += BATCH_SIZE) {
                const batch = convenentesToCreate.slice(i, i + BATCH_SIZE);
                const newConvenentes = await ConvenenteRepository.bulkCreateConvenentes(batch, transaction);
                for (const convenente of newConvenentes) {
                    convenentesMap[convenente.detailUrl] = convenente;
                }
            }

            // console.log("convenentesMap", convenentesMap);

            const conveniosToCreateOrUpdate = conveniosDTO.map(convenioDTO => convenioDTO.toEntity(convenentesMap[convenioDTO.convenente.detailUrl].id));
            // console.log("conveniosToCreateOrUpdate", conveniosToCreateOrUpdate);

            for (let i = 0; i < conveniosToCreateOrUpdate.length; i += BATCH_SIZE) {
                const batch = conveniosToCreateOrUpdate.slice(i, i + BATCH_SIZE);
                await ConveniosRepository.bulkCreateConveniosAndConvenentes(batch, transaction);
            }
            await transaction.commit();
            console.log("Transação concluida com sucesso");
        } catch (error: any) {
            await transaction.rollback();
            console.log(error.name, error.message);
            throw error;
        }
    }
}