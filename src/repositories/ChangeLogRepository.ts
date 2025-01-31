import ChangeLog from "../models/ChangeLog";
import ChangeLogDTO from "../dto/ChangeLog";

export class ChangeLogRepository {
    static async createLogEntry(log: ChangeLogDTO): Promise<void> {
        try {
            const newLog = new ChangeLog(log)
            await newLog.save();
        } catch (error: any) {
            console.log(`Ocorreu um erro ao tentar salvar o convenio ${log}`);
            console.error(error.name, error.message);
        }
    }

    static async getAll() {
        try {
            return ChangeLog.find({});
        } catch (error: any) {
            console.log("Ocorreu um erro ao buscar todos os convenios");
            console.error(error.name, error.message);
        }
    }
}