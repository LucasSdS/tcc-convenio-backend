import cron from "node-cron";
import PortalAPIController from "../modules/client-api-portal/controller/PortalAPIController";
import ConveniosService from "../modules/client-api-portal/service/ConveniosService";

export default class CronService {
    static schedule(): void {
        console.log("Agendando rotina do JOB para às 20:00");
        cron.schedule('45 20 * * *', () => CronService.executeJob(), { timezone: "America/Sao_Paulo" });
    }

    static async executeJob(): Promise<void> {
        try {
            console.log("Executando Job updateDB");
            await ConveniosService.updateAllConvenios();
            console.log("Job Executado com sucesso");

        } catch (error: any) {
            console.log(error.name, error.message);
            console.log("Ocorreu um erro ao tentarmos atualizar os convenios, pelo JOB");
        }
    }
}