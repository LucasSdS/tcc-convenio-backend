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
export default class IfesDTO {
    code: string;
    acronym: string;
    name: string;

    constructor(code: string, acronym: string, name: string) {
        this.code = code;
        this.acronym = acronym;
        this.name = name;
    }
}