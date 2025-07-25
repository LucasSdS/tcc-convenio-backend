import InternalServerError from "../errors/InternalServerError";
import ConvenioHistory from "../domain/ConvenioHistory";

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

    static async getLastUpdatedDate() {
        try {
            const lastUpdated = await ConvenioHistory.findOne({
                order: [['updatedAt', 'DESC']],
                attributes: ['updatedAt']
            });
            return lastUpdated ? lastUpdated.updatedAt : null;
        } catch (error: any) {
            console.log(error.name, error.message);
            throw new InternalServerError("Erro ao tentar buscar a data da última atualização dos convênios");
        }
    }

}