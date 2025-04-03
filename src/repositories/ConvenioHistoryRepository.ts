import InternalServerError from "../errors/InternalServerError";
import ConvenioHistory from "../models/ConvenioHistory";

export default class ConvenioHistoryRepository {

    static async saveConvenioHistory(convenioId: any, oldValues: object, newValues: object) {
        try {
            await ConvenioHistory.create({
                convenioId,
                oldValues,
                newValues,
                updatedAt: new Date(),
            });
        } catch (error: any) {
            console.log(error.name, error.message);
            throw new InternalServerError(`Ocorreu um erro ao tentarmos criar o historico do convẽnio ${convenioId}`);
        }
    }

}