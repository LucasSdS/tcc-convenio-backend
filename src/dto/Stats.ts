
/**
 * @swagger
 * components:
 *   schemas:
 *     StatsDTO:
 *       type: object
 *       description: Objeto contendo estatísticas consolidadas do sistema
 *       properties:
 *         totalConvenios:
 *           type: integer
 *           description: Número total de convênios cadastrados no sistema
 *           example: 3628
 *         totalIfes:
 *           type: integer
 *           description: Número total de Instituições Federais de Ensino Superior (IFES)
 *           example: 68
 *         totalConveniosActives:
 *           type: integer
 *           description: Número total de convênios ativos (vigentes na data atual)
 *           example: 516
 *         totalConvenentes:
 *           type: integer
 *           description: Número total de convenentes únicos no sistema
 *           example: 186
 *         convenentesTypes:
 *           type: array
 *           description: Lista dos tipos únicos de convenentes existentes no sistema
 *           items:
 *             type: string
 *           example: ["administração pública estadual ou do distrito federal", "administração pública municipal", "agentes intermediários", "entidades empresariais privadas", "entidades sem fins lucrativos", "pessoa física"]
 *         lastUpdatedDate:
 *           type: string
 *           format: date
 *           description: Data da última atualização de dados no sistema (considerando convênios e histórico)
 *           example: "2025-07-24"
 *       required:
 *         - totalConvenios
 *         - totalIfes
 *         - totalConveniosActives
 *         - totalConvenentes
 *         - convenentesTypes
 *         - lastUpdatedDate
 */
export default class StatsDTO {
    totalConvenios: number;
    totalIfes: number;
    totalConveniosActives: number;
    totalConvenentes: number;
    convenentesTypes: string[];
    lastUpdatedDate: Date;

    constructor(
        totalConvenios: number,
        totalIfes: number,
        totalConveniosActives: number,
        totalConvenentes: number,
        convenentesTypes: string[],
        lastUpdatedDate: Date
    ) {
        this.totalConvenios = totalConvenios;
        this.totalIfes = totalIfes;
        this.totalConveniosActives = totalConveniosActives;
        this.totalConvenentes = totalConvenentes;
        this.convenentesTypes = convenentesTypes;
        this.lastUpdatedDate = lastUpdatedDate;
    }
}