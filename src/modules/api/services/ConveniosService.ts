import RankingConveniosValidations from "../validations/RankingConveniosValidations";
import { buildDateOnly } from "../../../utils/DateUtils";
import IfesService from "./IfesService";
import ConveniosRepository from "../../../repositories/ConveniosRepository";
import IfesRankingDTO from "../dtos/IfesRanking";
import ConvenentesRankingDTO from "../dtos/ConvenentesRanking";
import ConvenentesService from "./ConvenentesService";

export default class ConveniosService {

    static async generateConveniosRanking(queryParams: any) {
        RankingConveniosValidations.validateData(queryParams.startYear);
        RankingConveniosValidations.validateData(queryParams.endYear);
        RankingConveniosValidations.validateLimit(queryParams.limit);
        console.log("Validou os campos");

        if (queryParams.startYear === null || queryParams.startYear === undefined) {
            queryParams.startYear = buildDateOnly("01/01/2020");
        } else {
            queryParams.startYear = buildDateOnly(queryParams.startYear);
        }

        if (queryParams.endYear === null || queryParams.endYear === undefined) {
            const anoCorrente = new Date().getFullYear();
            queryParams.endYear = buildDateOnly(`31/12/${anoCorrente}`);
        } else {
            queryParams.endYear = buildDateOnly(queryParams.endYear);
        }

        const ifesRankingPartial = await ConveniosService.getIfesCodeAndTotalValueReleasedFromConvenios(queryParams.startYear, queryParams.endYear, queryParams.limit);
        const ifesRankingDTO = await IfesService.getIfesRanking(ifesRankingPartial, queryParams.startYear, queryParams.endYear);

        const convenentesRankingPartial = await ConveniosService.getConvenentesAndTotalValueReleasedFromConvenios(queryParams.startYear, queryParams.endYear, queryParams.limit);
        const convenentesRankingDTO = await ConvenentesService.getConvenentesRanking(convenentesRankingPartial, queryParams.startYear, queryParams.endYear);
        return { ifesRankingDTO, convenentesRankingDTO };
    }

    static async getIfesCodeAndTotalValueReleasedFromConvenios(startYear: Date, endYear: Date, limit: number) {
        return IfesRankingDTO.fromPartialIfesRankingEntities(await ConveniosRepository.getIfesCodeAndTotalValueReleasedFromConvenios(startYear, endYear, limit));
    }

    static async getConvenentesAndTotalValueReleasedFromConvenios(startYear: Date, endYear: Date, limit: number) {
        return ConvenentesRankingDTO.fromPartialConvenentesRankingEntities(await ConveniosRepository.getConvenentesAndTotalValueReleasedFromConvenios(startYear, endYear, limit));
    }
}