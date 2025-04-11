import { Transaction } from "sequelize";
import sequelize from "../../../../database/postgresqlConfig";
import ConvenioDTO from "../../../dto/Convenio";
import ConveniosRepository from "../../../repositories/ConveniosRepository";
import PortalAPI from "./ClientPortalAPI";
import ConvenenteService from "./ConvenenteService";
import IfesService from "../../api/services/IfesService";
import { logger } from "../../../utils/ContextLogger";


export default class ConveniosService {
    private static conveniosServiceLogger = logger.createContextLogger("ConveniosServiceLog");

    static async updateAllConvenios() {
        const ifesList = await IfesService.getAllIfes();
        await Promise.all(ifesList.map(async (ifes) => {
            const resDTO = await this.getConveniosData(ifes.code)
            const conveniosDTO = resDTO.flat();
            await this.createConveniosAndConvenentes(conveniosDTO);
        }));
    }

    static async getConveniosData(ifesCode: string): Promise<ConvenioDTO[]> {
        console.log(`Iniciando processamento da instituição: ${ifesCode}`);
        this.conveniosServiceLogger.info(`Iniciando processamento da instituição: ${ifesCode}`, "ConveniosServiceLog");

        const resDTO: ConvenioDTO[][] = [];
        let currYear = new Date().getFullYear();
        let cycleYear = true;

        while (cycleYear) {
            let page = 1;
            let response = await PortalAPI.getConveniosByYear(ifesCode, currYear.toString(), page);
            resDTO.push(response);

            await new Promise(resolve => setTimeout(resolve, 200));

            while (response.length) {
                page++;
                response = await PortalAPI.getConveniosByYear(ifesCode, currYear.toString(), page);
                resDTO.push(response)

                await new Promise(resolve => setTimeout(resolve, 100));
            }
            // if (!response.length && page === 1) cycleYear = false
            // if (currYear < 2000) cycleYear = false
            if (currYear < 2024) cycleYear = false
            currYear--;
        }

        await new Promise(resolve => setTimeout(resolve, 200));
        this.conveniosServiceLogger.info(`Encontrados ${resDTO.length} convênios para instituição ${ifesCode} \nResposta: ${resDTO}`, "ConveniosServiceLog");
        return resDTO.flat();
    }

    static async createConveniosAndConvenentes(conveniosDTO: ConvenioDTO[]) {
        let convenentesMap = await ConvenenteService.getAllConvenentesMap();

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
}