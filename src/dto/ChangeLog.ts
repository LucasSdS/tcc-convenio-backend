/**
 * @swagger
 * components:
 *   schemas:
 *     ChangeLog:
 *       type: object
 *       properties:
 *         changeDate:
 *           type: string
 *           format: date-time
 *           description: Data da alteração
 *         updatedBy:
 *           type: string
 *           description: Usuário que realizou a alteração
 *         convenio:
 *           type: string
 *           description: ID do convênio alterado
 *         changes:
 *           type: array
 *           items:
 *             type: object
 *           description: Lista de alterações realizadas
 *       required:
 *         - changeDate
 *         - updatedBy
 *         - convenio
 *         - changes
 */
export default class ChangeLogDTO {
    changeDate: Date;

    updatedBy: string;

    convenio: string;

    changes: Object[];

    constructor(
        changeDate: Date,
        updatedBy: string,
        convenio: string,
        changes: Object[]
    ) {
        this.changeDate = changeDate;
        this.updatedBy = updatedBy;
        this.convenio = convenio;
        this.changes = changes;
    }
}
