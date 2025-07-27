import { Transaction } from "sequelize";
import sequelize from "../config/postgresqlConfig";
import ConvenioDTO from "../dto/Convenio";
import ConveniosRepository from "../repositories/ConveniosRepository";
import PortalAPI from "../integrations/ClientPortalAPI";
import ConvenenteService from "./PortalConvenentesService";
import IfesService from "./IfesService";
import { logger } from "../utils/ContextLogger";
import { ChangeLogRepository } from "../repositories/ChangeLogRepository";
import ChangeLogDTO from "../dto/ChangeLog";

export default class PortalConveniosService {
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
        const resDTO: ConvenioDTO[][] = [];
        let currYear = new Date().getFullYear();
        let cycleYear = true;

        while (cycleYear) {
            this.conveniosServiceLogger.info(`Buscando convênios da instituição ${ifesCode} no ano: ${currYear}`, "ConveniosServiceLog");
            let page = 1;
            let response = await PortalAPI.getConveniosByYear(ifesCode, currYear.toString(), page);
            resDTO.push(response);

            while (response.length) {
                page++;
                response = await PortalAPI.getConveniosByYear(ifesCode, currYear.toString(), page);
                resDTO.push(response)
            }
            if (currYear < 1996) cycleYear = false
            currYear--;
        }

        this.conveniosServiceLogger.info(`Encontrados ${resDTO.length} convênios para instituição ${ifesCode} \nResposta: ${JSON.stringify(resDTO)}`, "ConveniosServiceLog");
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

                convenioDTO.convenenteId = convenenteId;
                await PortalConveniosService.createOrUpdate(convenioDTO, transaction);

                await transaction.commit();
            } catch (error: any) {
                console.log("[CONVENIOS_SERVICE] Erro ao tentar criar convenio e convenente");
                console.log(error.name, error.message);
                await transaction.rollback();
            }
        }
    }


    static async createOrUpdate(convenioToPersist: ConvenioDTO, transaction?: Transaction) {
        try {
            const convenioExists = await ConveniosRepository.findConvenioByCode(convenioToPersist.number);

            if (!convenioExists){
                convenioToPersist.isPotentiallyTruncated = 
                    PortalConveniosService.isValueUnder10k(convenioToPersist.totalValueReleased) ||
                    PortalConveniosService.isValueUnder10k(convenioToPersist.valueLastRelease) ||
                    PortalConveniosService.isValueUnder10k(convenioToPersist.totalValue);

                const convenioCreated = await ConveniosRepository.create(convenioToPersist, transaction!);
                this.conveniosServiceLogger.info(`Convenio criado com sucesso: ${JSON.stringify(convenioCreated)}`, "ConveniosServiceLog");
                return convenioCreated;
            }

            const convenioExistsDTO = ConvenioDTO.fromEntity(convenioExists);

            if (convenioToPersist.equals(convenioExistsDTO!)) {
                return convenioExists;
            }

            const [newValue, oldValue, isPotentiallyTruncated] = convenioToPersist.getDiff(convenioExistsDTO!);

            const diffKeys = convenioToPersist.getDiffKeys(convenioExistsDTO!);

            if (Object.keys(newValue).length === 0) {
                return convenioExists;
            }

            Object.entries(newValue).forEach(([key, value]) => {
                (convenioExists as any)[key] = value;
            });

            convenioExists.isPotentiallyTruncated = isPotentiallyTruncated;

            const convenioUpdated = await ConveniosRepository.update(convenioExists, oldValue, newValue, transaction!);

            const changeLog = ChangeLogDTO.generateChangeLogDTOByDiff(convenioToPersist, convenioExistsDTO!, diffKeys)

            await ChangeLogRepository.createLogEntry(changeLog);

            this.conveniosServiceLogger.info(`Convenio atualizado com sucesso: ${JSON.stringify(convenioUpdated)}`, "ConveniosServiceLog");

            return convenioUpdated;
        } catch(error: any) {
            console.log(error.name, error.message);
            throw error;
        }
    }

    

    static async updateConvenio(convenioId: string) {
        const transaction = await sequelize.transaction();
        try {
            const convenioDTO = await PortalAPI.getConveniosByCode(convenioId);
            if (!convenioDTO) {
                console.log("[CONVENIOS_SERVICE] Não foi possível encontrar o convenio com o id: ", convenioId);
                this.conveniosServiceLogger.error(`Não foi possível encontrar o convenio com o id: ${convenioId}`, "ConveniosServiceLog");
                return;
            }

            const convenioCreatedOrUpdated = await PortalConveniosService.createOrUpdate(convenioDTO, transaction);
            await transaction.commit();
            return convenioCreatedOrUpdated;
        } catch (error: any) {
            console.log("[CONVENIOS_SERVICE] Erro ao tentar atualizar convenio");
            this.conveniosServiceLogger.error(`Erro ao tentar atualizar convenio: ${convenioId} \nErro: ${error.message}`, "ConveniosServiceLog");
            console.log(error.name, error.message);
            await transaction.rollback();
        }
    }


    static isValueUnder10k(value: number): boolean {
        return value < 10000;
    }

    static async updateAllConveniosPottentialyTruncated(){
        try {
            const conveniosPotentiallyTruncated = await ConveniosRepository.findAllPotentiallyTruncated();
            if (!conveniosPotentiallyTruncated || conveniosPotentiallyTruncated.length === 0) {
                console.log("[CONVENIOS_SERVICE] Não existem convênios potencialmente truncados para atualizar");
                this.conveniosServiceLogger.info("Não existem convênios potencialmente truncados para atualizar", "ConveniosServiceLog");
                return;
            }

            let updatedConvenios = [];

            for(let convenioPersisted of conveniosPotentiallyTruncated){
                const transaction = await sequelize.transaction();
                const convenioDTO = await PortalAPI.getConveniosByCode(convenioPersisted.number);
                
                if (!convenioDTO) {
                    console.log("[CONVENIOS_SERVICE] Não foi possível encontrar o convenio com o id: ", convenioPersisted.number);
                    this.conveniosServiceLogger.error(`Não foi possível encontrar o convenio com o id: ${convenioPersisted.number}`, "ConveniosServiceLog");
                    await transaction.rollback();
                    continue;
                }
    
                const convenioPersistedDTO = ConvenioDTO.fromEntity(convenioPersisted);
                if (convenioDTO.equals(convenioPersistedDTO!)) {
                    console.log("[CONVENIOS_SERVICE] O convênio já está atualizado, não há necessidade de atualizar novamente: ", convenioPersisted.number);
                    this.conveniosServiceLogger.info(`O convênio já está atualizado, não há necessidade de atualizar novamente: ${convenioPersisted.number}`, "ConveniosServiceLog");
                    await transaction.rollback();
                    continue;
                }
    
                const [newValue, oldValue, isPotentiallyTruncated] = convenioDTO.getDiff(convenioPersistedDTO!);
    
                if (Object.keys(newValue).length === 0) {
                    await transaction.rollback();
                    continue;
                }
                Object.entries(newValue).forEach(([key, value]) => {
                    (convenioPersisted as any)[key] = value;
                });
    
                convenioPersisted.isPotentiallyTruncated = isPotentiallyTruncated;
    
                try {
                    const convenioUpdated = await ConveniosRepository.update(convenioPersisted, oldValue, newValue, transaction!);
                    updatedConvenios.push(convenioUpdated);
                    this.conveniosServiceLogger.info(`Convenio atualizado com sucesso: ${JSON.stringify(convenioUpdated)}`, "ConveniosServiceLog");
                    await transaction.commit();
                    try {
                      const diffKeys = convenioDTO.getDiffKeys(convenioPersistedDTO!);
                      const changeLog = ChangeLogDTO.generateChangeLogDTOByDiff(convenioDTO, convenioPersistedDTO!, diffKeys)
                      await ChangeLogRepository.createLogEntry(changeLog);
                    } catch(error: any) {
                      console.log("[CONVENIOS_SERVICE] Erro ao tentar atualizar convenio potencialmente truncado");
                      this.conveniosServiceLogger.error(`Erro ao tentar criar changelog para o convenio: ${convenioPersisted.number} \nErro: ${error.message}`, "ConveniosServiceLog");
                      console.log(error.name, error.message);
                    }
                    
                }catch (error: any) {
                    console.log("[CONVENIOS_SERVICE] Erro ao tentar atualizar convenio potencialmente truncado");
                    this.conveniosServiceLogger.error(`Erro ao tentar atualizar convenio potencialmente truncado: ${convenioPersisted.number} \nErro: ${error.message}`, "ConveniosServiceLog");
                    console.log(error.name, error.message);
                    await transaction.rollback();
                }
            }

            return updatedConvenios;

        }catch (error: any) {
            console.log("[CONVENIOS_SERVICE] Erro ao tentar atualizar todos os convênios potencialmente truncados");
            this.conveniosServiceLogger.error(`Erro ao tentar atualizar todos os convênios potencialmente truncados: ${error.message}`, "ConveniosServiceLog");
            console.log(error.name, error.message);
        }
    }
}
