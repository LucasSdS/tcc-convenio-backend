import ConvenioHistory from "../models/ConvenioHistory";

export default class ConvenioHistoryRepository {

    static async saveConvenioHistory(convenioId: any, oldValues: object, newValues: object) {
        await ConvenioHistory.create({
            convenioId,
            oldValues,
            newValues,
            updatedAt: new Date(),
        });

    }

}