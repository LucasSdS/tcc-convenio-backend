/**
 * @swagger
 * components:
 *   schemas:
 *     Error:
 *       type: object
 *       properties:
 *         status:
 *           type: integer
 *           description: Código de status HTTP do erro
 *           example: 400
 *         message:
 *           type: string
 *           description: Mensagem descritiva do erro
 *           example: "Parâmetro inválido"
 *         details:
 *           type: string
 *           description: Detalhes adicionais sobre o erro
 *           example: "O campo 'nome' é obrigatório"
 *       required:
 *         - status
 *         - message
 *         - details
 */
export default class ErrorDTO {
    status: number;
    message: string;
    details: string;

    constructor(status: number, message: string, details: string) {
        this.status = status;
        this.message = message;
        this.details = details;
    }

}