import IfesRankingDTO from "./IfesRanking";

/**
 * @swagger
 * components:
 *   schemas:
 *     Ifes:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: Código identificador da Ifes
 *           example: "26234"
 *         acronym:
 *           type: string
 *           description: Sigla da Ifes
 *           example: "UFMG"
 *         name:
 *           type: string
 *           description: Nome completo da Ifes
 *           example: "Universidade Federal de Minas Gerais"
 *       required:
 *         - code
 *         - acronym
 *         - name
 */
export default class ConvenentesRankingDTO {
    convenenteId: number;
    name: string;
    totalValueReleased: number;
    detailUrl: string;
    ifes?: IfesRankingDTO;

    constructor(data: any) {
        this.convenenteId = data.convenenteId;
        this.totalValueReleased = data.totalValueReleased;
        this.name = data.name || '';
        this.ifes = data.ifes || null;
        this.detailUrl = data.detailUrl || '';
    }

    /**
     * Método responsavel por popular parcialmente um ConvenentesRankingDTO, vindo da consulta ConvenioService.getConveniosAndTotalValueReleasedFromConvenios
     * Trazendo apenas os campos:
     * convenentesRankingPartialEntity: [
     *  {
     *      convenenteId: "number",
     *      totalValueReleased: "number"
     *  }, ... 
     * ]
     * @param convenentesRankingPartialEntities 
     */
    static fromPartialConvenentesRankingEntities(ifesRankingPartialEntities: any[]) {
        return ifesRankingPartialEntities.map(ifesRankingPartial => ConvenentesRankingDTO.fromPartialConvenentesRankingEntity(ifesRankingPartial));
    }

    /**
     * Transforma cada convenentesRankingPartialEntity em uma lista de ConvenentesRankingDTO
     * @param convenentesRankingPartialEntity 
     * @returns ConvenentesRankingDTO[]
     */
    static fromPartialConvenentesRankingEntity(convenentesRankingPartialEntity: any) {
        return new ConvenentesRankingDTO(convenentesRankingPartialEntity);
    }

}