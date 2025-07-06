import ConvenentesRankingDTO from "./ConvenentesRanking";

/**
 * @swagger
 * components:
 *   schemas:
 *     IfesRanking:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *           description: Código da Ifes
 *           example: "26234"
 *         name:
 *           type: string
 *           description: Nome da Ifes
 *           example: "Universidade Federal de Minas Gerais"
 *         totalValueReleased:
 *           type: number
 *           description: Valor total liberado
 *           example: 25750000.45
 *         convenentes:
 *           type: array
 *           description: Lista de convenentes associados à Ifes
 *           items:
 *             $ref: '#/components/schemas/ConvenentesRanking'
 *       required:
 *         - code
 *         - totalValueReleased
 */
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