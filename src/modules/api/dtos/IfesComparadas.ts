import ConvenioDTO from "../../../dto/Convenio";

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
