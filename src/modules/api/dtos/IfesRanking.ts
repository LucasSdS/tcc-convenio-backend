import ConvenentesRankingDTO from "./ConvenentesRanking";

export default class IfesRankingDTO {
    code: string;
    name?: string;
    totalValueReleased: number;
    convenentes?: ConvenentesRankingDTO[];

    constructor(data: any) {
        this.code = data.code;
        if (data.name) {
            this.name = data.name;
        }
        this.totalValueReleased = data.totalValueReleased;
        if (data.convenentes) {
            this.convenentes = data.convenentes;
        }
    }

    /**
     * Método responsavel por popular parcialmente um ifesRankingDTO, vindo da consulta ConvenioService.getIfesCodeAndTotalValueReleasedFromConvenios
     * Trazendo apenas os campos:
     * ifesRankingPartialEntity: [
     *  {
     *      code: "string",
     *      totalValueReleased: "number"
     *  }, ... 
     * ]
     * @param ifesRankingPartialEntities 
     */
    static fromPartialIfesRankingEntities(ifesRankingPartialEntities: any[]) {
        return ifesRankingPartialEntities.map(ifesRankingPartial => IfesRankingDTO.fromPartialIfesRankingEntity(ifesRankingPartial));
    }

    /**
     * Transforma cada ifesRankingPartialEntity em IfesRankingDTO
     * @param ifesRankingPartialEntity 
     * @returns 
     */
    static fromPartialIfesRankingEntity(ifesRankingPartialEntity: any) {
        return new IfesRankingDTO(ifesRankingPartialEntity);
    }




}