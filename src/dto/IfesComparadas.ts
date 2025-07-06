import ConvenioDTO from "../dto/Convenio";


/**
 * @swagger
 * components:
 *   schemas:
 *     IfesComparadas:
 *       type: object
 *       properties:
 *         nome:
 *           type: string
 *           description: Nome da Ifes
 *           example: "Universidade Federal de Minas Gerais"
 *         qtdConvenios:
 *           type: integer
 *           description: Quantidade de convênios
 *           example: 42
 *         valorTotalLiberado:
 *           type: number
 *           description: Valor total liberado
 *           example: 15650000.75
 *         listaConvenios:
 *           type: array
 *           description: Lista de convênios associados à Ifes
 *           items:
 *             $ref: '#/components/schemas/Convenio'
 *       required:
 *         - nome
 */
export default class IfesComparadasDTO {
    nome: string;
    qtdConvenios: number;
    valorTotalLiberado: number;
    listaConvenios: ConvenioDTO[];

    constructor(nome: string, listaConvenios: any[]) {
        this.nome = nome;
        this.listaConvenios = listaConvenios;
        this.qtdConvenios = listaConvenios ? listaConvenios.length : 0;
        this.valorTotalLiberado = this.calculaValorTotalLiberado();
    }

    private calculaValorTotalLiberado(): number {
        if (this.listaConvenios) {
            return this.listaConvenios.reduce((acc, convenio) => {
                return acc += convenio.totalValueReleased;
            }, 0);
        } else
            return 0;
    }

}
