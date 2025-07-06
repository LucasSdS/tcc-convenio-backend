import BadRequestError from "../errors/BadRequestError";
import DataValidations from "./DataValidations";

export default class RankingConveniosValidations {

    /**
     * @param data no formato "dd/mm/yyyy"
     * @returns void ou error
     */
    static validateData(data: string): any {
        if (!data || data.length < 10) {
            throw new BadRequestError(`Erro ao validar o campo data ${data}`);
        }

        DataValidations.validateData(data);
    }

    static validateLimit(limit: number): any {
        if (!limit || limit < 0 || limit > 20) {
            throw new BadRequestError(`Erro ao validar o campo limit ${limit}`);
        }
    }
}