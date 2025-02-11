import RankingConveniosValidations from "../validations/RankingConveniosValidations";
import { buildDateOnly } from "../../../utils/DateUtils";
import IfesService from "./IfesService";
import ConveniosRepository from "../../../repositories/ConveniosRepository";
import IfesRankingDTO from "../dtos/IfesRanking";
import ConvenentesRankingDTO from "../dtos/ConvenentesRanking";
import ConvenentesService from "./ConvenentesService";
import NotFoundError from "../../../errors/NotFoundError";

export default class ConveniosService {

    static async getAllConvenios() {
        const convenios = await ConveniosRepository.getAll();
        if (!convenios) {
            throw new NotFoundError("Convenios não encontrados, tente novamente mais tarde");
        }
    }

    static async getConveniosByNumber(number: string) {
        const convenio = await ConveniosRepository.getConvenioByNumber(number);
        if (!convenio) {
            throw new NotFoundError("Convenio não encontrado, tente novamente mais tarde");
        }
        return convenio;
    }

    static async generateConveniosRanking(queryParams: any) {
        RankingConveniosValidations.validateData(queryParams.startYear);
        RankingConveniosValidations.validateData(queryParams.endYear);
        RankingConveniosValidations.validateLimit(queryParams.limit);

        const startYear = buildDateOnly(queryParams.startYear);
        const endYear = buildDateOnly(queryParams.endYear);
        const limit = queryParams.limit;

        const ifesRankingPartial = await ConveniosService.getIfesCodeAndTotalValueReleasedFromConvenios(startYear, endYear, limit);
        const ifesRankingDTO = await IfesService.getIfesRanking(ifesRankingPartial, startYear, endYear);

        const convenentesRankingPartial = await ConveniosService.getConvenentesAndTotalValueReleasedFromConvenios(startYear, endYear, limit);
        const convenentesRankingDTO = await ConvenentesService.getConvenentesRanking(convenentesRankingPartial, startYear, endYear);

        return { ifesRankingDTO, convenentesRankingDTO };
    }

    static async getIfesCodeAndTotalValueReleasedFromConvenios(startYear: Date, endYear: Date, limit: number) {
        return IfesRankingDTO.fromPartialIfesRankingEntities(
            await ConveniosRepository.getIfesCodeAndTotalValueReleasedFromConvenios(startYear, endYear, limit)
        );
    }

    static async getConvenentesAndTotalValueReleasedFromConvenios(startYear: Date, endYear: Date, limit: number) {
        return ConvenentesRankingDTO.fromPartialConvenentesRankingEntities(
            await ConveniosRepository.getConvenentesAndTotalValueReleasedFromConvenios(startYear, endYear, limit)
        );
    }
}