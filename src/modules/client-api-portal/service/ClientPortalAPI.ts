import axios from "axios";
import ConvenioDTO from "../../../dto/Convenio";
import ConveniosRepository from "../../../repositories/ConveniosRepository";
import ConvenenteDTO from "../../../dto/Convenente";
import IfesRepository from "../../../repositories/IfesRepository";

export default class PortalAPI {
    static async call(ifesCode: string, year: string, page: number): Promise<ConvenioDTO[]> {
        console.log("Executando PortalAPI da ifesCode", ifesCode, "ano:", year, "page: ", page);
        const urlTemplate = `https://api.portaldatransparencia.gov.br/api-de-dados/convenios?codigoOrgao=${ifesCode}&pagina=${page}&dataUltimaLiberacaoInicial=01/01/${year}&dataUltimaLiberacaoFinal=31/12/${year}`;
        try {
            const response = await axios(urlTemplate, {
                headers: {
                    "chave-api-dados": process.env.APIKEY
                },
                responseType: "json"
            });
            if (response.data.length) {
                return parseResponseToDTO(response.data, ifesCode);
            }
            return []
        } catch (error: any) {
            console.error(error.name, error.message);
            throw error;
        }
    }

}

const parseResponseToDTO = (response: any[], ifesCode: string): ConvenioDTO[] => {
    let convenios: ConvenioDTO[] = [];
    response.forEach((element: any) => {
        const detailConvenioUrlTemplate = `https://portaldatransparencia.gov.br/convenios/${element.dimConvenio.codigo}`;

        const cnpjDesformatado = element.convenente.cnpjFormatado.replace(/\D/g, '');
        const convenenteNome = element.convenente.nome.toLowerCase().replace(/[\s\W]+/g, '-');
        const detailDestinationUrlTemplate = `https://portaldatransparencia.gov.br/pessoa-juridica/${cnpjDesformatado}-${convenenteNome}`;
        let convenente = new ConvenenteDTO({ name: element.convenente.nome.toLowerCase(), type: element.convenente.tipo.toLowerCase(), detailUrl: detailDestinationUrlTemplate });

        let convenio = new ConvenioDTO({
            detailUrl: detailConvenioUrlTemplate,
            ifesCode: ifesCode,
            number: element.dimConvenio.codigo,
            description: element.dimConvenio.objeto,
            origin: element.unidadeGestora.orgaoVinculado.nome,
            totalValueReleased: element.valorLiberado,
            startEffectiveDate: new Date(element.dataInicioVigencia),
            endEffectiveDate: new Date(element.dataFinalVigencia),
            lastReleaseDate: new Date(element.dataUltimaLiberacao),
            valueLastRelease: element.valorDaUltimaLiberacao,
            totalValue: element.valor,
            convenente: convenente,
        });
        convenios.push(convenio);
    });

    console.log("Encontrados ", convenios.length, " convenios da ife: ", ifesCode);
    return convenios;
}

