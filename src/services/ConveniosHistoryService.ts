import NotFoundError from "../errors/NotFoundError";
import ConvenioHistoryRepository from "../repositories/ConvenioHistoryRepository";

export default class ConveniosHistoryService {
    static async getLastUpdatedDate() {
        const lastUpdated = await ConvenioHistoryRepository.getLastUpdatedDate();
        if (!lastUpdated) {
            throw new NotFoundError("Data de última atualização não encontrada", "Não foi possível encontrar a data da última atualização dos convênios");
        }
        return lastUpdated;
    }
}