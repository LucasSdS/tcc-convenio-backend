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
 *         qtdConvenios:
 *           type: integer
 *           description: Quantidade de convênios
 *         valorTotalLiberado:
 *           type: number
 *           description: Valor total liberado
 *         listaConvenios:
 *           type: array
 *           description: Lista de convênios associados à Ifes
 *           items:
 *             $ref: '#/components/schemas/ConvenioDTO'
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
