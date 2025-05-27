import cron from "node-cron";
import ConveniosService from "../modules/client-api-portal/service/ConveniosService";
import { logger } from "../utils/ContextLogger";

export default class CronService {
    private static cronLogger = logger.createContextLogger("CronService");

    static schedule(): void {
        this.cronLogger.info("Iniciando o JOB de atualização de todos os convênios para às 00 até as 06", "cronService");
        console.log("Agendando rotina do JOB para às 00 até as 06");
        cron.schedule('*/30 02-06 * * *', () => CronService.executeJob(), { timezone: "America/Sao_Paulo" });
        
        this.cronLogger.info("Iniciando o JOB de atualização de todos os convênios TRUNCADOS para às 00 até as 06 a cada 30 minutos", "cronService");
        console.log("Iniciando o JOB de atualização de todos os convênios TRUNCADOS para às 00 até as 06 a cada 30 minutos");
        cron.schedule('*/30 * * * *', () => CronService.executeUpdateAllConveniosPotentiallyTruncated(), { timezone: "America/Sao_Paulo" });
    }

    static async executeJob(): Promise<void> {
        try {
            console.log("Executando Job updateDB");
            await ConveniosService.updateAllConvenios();
            console.log("Job Executado com sucesso");
            this.cronLogger.info("Job Executado com sucesso", "CronService");

        } catch (error: any) {
            this.cronLogger.error("Erro ao executar o JOB de atualização dos convênios. Erro: " + error.message, "CronService");
            console.log(error.name, error.message);
            console.log("Ocorreu um erro ao tentarmos atualizar os convenios, pelo JOB");
        }
    }

    static async executeUpdateAllConveniosPotentiallyTruncated(): Promise<void> {
        try {
            console.log("Executando Job updateAllConveniosPotentiallyTruncated");
            const conveniosUpdated = await ConveniosService.updateAllConveniosPottentialyTruncated();
            console.log(`Job Executado com sucesso. ${conveniosUpdated?.length} convênios atualizados`);
            this.cronLogger.info(`Job Executado com sucesso. ${conveniosUpdated?.length} convênios atualizados`, "CronService");

        } catch (error: any) {
            this.cronLogger.error("Erro ao executar o JOB de atualização dos convênios potencialmente truncados. Erro: " + error.message, "CronService");
            console.log(error.name, error.message);
            console.log("Ocorreu um erro ao tentarmos atualizar os convenios potencialmente truncados, pelo JOB");
        }
    }
}
// 300 req / min => 300 / 60 sec = 5 req / sec = 200ms por req
// 600 req / min => 600 / 60 sec = 10 req / sec = 100ms por req