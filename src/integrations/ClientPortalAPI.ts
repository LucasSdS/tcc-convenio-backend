import axios from "axios";
import ConvenioDTO from "../dto/Convenio";
import ConvenenteDTO from "../dto/Convenente";
import { logger } from "../utils/ContextLogger";
import { apiQueue } from "../utils/RequestQueue";
import { getApiKey } from "../utils/ApiKey";

export default class PortalAPI {
    public static portalAPILogger = logger.createContextLogger("PortalAPI");

    static async getConveniosByYear(ifesCode: string, year: string, page: number): Promise<ConvenioDTO[]> {
        return apiQueue.add(async () => {
            const urlTemplate = `https://api.portaldatransparencia.gov.br/api-de-dados/convenios?codigoOrgao=${ifesCode}&pagina=${page}&dataUltimaLiberacaoInicial=01/01/${year}&dataUltimaLiberacaoFinal=31/12/${year}`;
            const RANDOMAPIKEY = getApiKey();
            try {
                const response = await axios(urlTemplate, {
                    headers: {
                        "chave-api-dados": RANDOMAPIKEY
                    },
                    responseType: "json"
                });

                if (response.status !== 200) {
                    this.portalAPILogger.error(`Erro ao buscar convênios da universidade com código ${ifesCode} no ano: ${year} paginacao: ${page}`, "PortalAPI");
                    throw new Error(`Erro ao buscar convênios da universidade com código ${ifesCode} no ano: ${year} paginacao: ${page}`);
                }

                const convenios = response.data.map((element: any) => {
                    return parseResponseToDTO(element, ifesCode);
                });

                return convenios;
            } catch (error: any) {
                console.error(error.name, error.message);
                this.portalAPILogger.error(`Erro ao buscar convênios da universidade com código ${ifesCode} no ano: ${year} paginacao: ${page} com APIKEY: ${RANDOMAPIKEY} - Erro: ${error.message}`, "PortalAPI");
                throw error;
            }
        });
    }

    static async getConveniosByCode(code: string): Promise<ConvenioDTO | null> {
        return apiQueue.add(async () => {
            const urlTemplate = `https://api.portaldatransparencia.gov.br/api-de-dados/convenios/numero?numero=${code}&pagina=1`;
            const RANDOMAPIKEY = getApiKey();
            try {
                const response = await axios(urlTemplate, {
                    headers: {
                        "chave-api-dados": RANDOMAPIKEY
                    },
                    responseType: "json"
                });

                if (response.data && response.data.length > 0) {
                    const convenio = response.data[0];
                    return parseResponseToDTO(convenio, convenio.orgao.codigoSIAFI);
                }

                return null;

            } catch (error: any) {
                console.error(error.name, error.message);
                this.portalAPILogger.error(`Erro ao buscar convênio pelo número: ${code} com APIKEY: ${RANDOMAPIKEY} - Erro: ${error.message}`, "PortalAPI");
                throw error;
            }
        });
    }

}

const parseResponseToDTO = (convenio: any, ifesCode: string): ConvenioDTO | null => {

    const detailConvenioUrlTemplate = `https://portaldatransparencia.gov.br/convenios/${convenio.dimConvenio.codigo}`;
    const cnpjDesformatado = convenio.convenente.cnpjFormatado.replace(/\D/g, '');
    const convenenteNome = convenio.convenente.nome.toLowerCase().replace(/[\s\W]+/g, '-');
    const detailDestinationUrlTemplate = `https://portaldatransparencia.gov.br/pessoa-juridica/${cnpjDesformatado}-${convenenteNome}`;
    let convenente = new ConvenenteDTO({ name: convenio.convenente.nome.toLowerCase(), type: convenio.convenente.tipo.toLowerCase(), detailUrl: detailDestinationUrlTemplate });

    return new ConvenioDTO({
        detailUrl: detailConvenioUrlTemplate,
        ifesCode: ifesCode,
        number: convenio.dimConvenio.codigo,
        description: convenio.dimConvenio.objeto,
        origin: convenio.unidadeGestora.orgaoVinculado.nome,
        totalValueReleased: convenio.valorLiberado,
        startEffectiveDate: new Date(convenio.dataInicioVigencia),
        endEffectiveDate: new Date(convenio.dataFinalVigencia),
        lastReleaseDate: new Date(convenio.dataUltimaLiberacao),
        valueLastRelease: convenio.valorDaUltimaLiberacao,
        totalValue: convenio.valor,
        convenente: convenente,
    });

}

