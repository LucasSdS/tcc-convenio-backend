import cron from "node-cron";
import ConveniosService from "../modules/client-api-portal/service/ConveniosService";
import { logger } from "../utils/ContextLogger";

export default class CronService {
    private static cronLogger = logger.createContextLogger("CronService");

    static schedule(): void {
        this.cronLogger.info("Iniciando o JOB de atualização dos convênios para às 02:00", "cronService");
        console.log("Agendando rotina do JOB para às 02:00");
        cron.schedule('40 02 * * *', () => CronService.executeJob(), { timezone: "America/Sao_Paulo" });
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
}