import axios from "axios";
import ConvenioDTO from "../../../dto/Convenio";
import ConvenenteDTO from "../../../dto/Convenente";
import { normalizeValueNumber } from "../../../utils/NumberUtils";
import { logger } from "../../../utils/ContextLogger";

export default class PortalAPI {
    public static portalAPILogger = logger.createContextLogger("PortalAPI");

    static async getConveniosByYear(ifesCode: string, year: string, page: number): Promise<ConvenioDTO[]> {
        console.log("[PortalAPI.getConveniosByYear] Buscando convênios da universidade com código", ifesCode, " no ano:", year, "paginacao: ", page);
        this.portalAPILogger.info(`Buscando convênios da universidade com código ${ifesCode} no ano: ${year} paginacao: ${page}`, "PortalAPI");
        const urlTemplate = `https://api.portaldatransparencia.gov.br/api-de-dados/convenios?codigoOrgao=${ifesCode}&pagina=${page}&dataUltimaLiberacaoInicial=01/01/${year}&dataUltimaLiberacaoFinal=31/12/${year}`;
        try {
            const response = await axios(urlTemplate, {
                headers: {
                    "chave-api-dados": process.env.API_KEY_0
                },
                responseType: "json"
            });
            return parseResponseToDTO(response.data, ifesCode);
        } catch (error: any) {
            console.error(error.name, error.message);
            throw error;
        }
    }

    static async geConveniosByCode(code: string): Promise<ConvenioDTO | null> {
        console.log("[PortalAPI.geConveniosByCode] Buscando convenio pelo numero: ", code);
        this.portalAPILogger.info(`Buscando convenio pelo numero: ${code}`, "PortalAPI");
        const urlTemplate = `https://api.portaldatransparencia.gov.br/api-de-dados/convenios/numero?numero=${code}&pagina=1`;
        try {
            const response = await axios(urlTemplate, {
                headers: {
                    "chave-api-dados": process.env.API_KEY_1
                },
                responseType: "json"
            });

            console.log(`[PortalAPI.geConveniosByCode] resposta de detalhe do Convenio: ${code}`, response.data);
            this.portalAPILogger.info(`Resposta de detalhe do convenio: ${code} - \nresposta: ${JSON.stringify(response.data)}`, "PortalAPI");

            if (response.data && response.data.length > 0) {
                return response.data[0];
            }

            return null;

        } catch (error: any) {
            console.error(error.name, error.message);
            throw error;
        }
    }

}

const checkValueIsUnder10000 = (element: any): boolean => {
    return element.valorLiberado < 10000 ||
        element.valorDaUltimaLiberacao < 10000 ||
        element.valor < 10000;
}

const parseResponseToDTO = (response: any[], ifesCode: string): ConvenioDTO[] => {
    let convenios: ConvenioDTO[] = [];

    response.forEach(async (element: any) => {
        if (checkValueIsUnder10000(element)) {
            console.log("[ClientPortalAPI.parseResponseToDTO] ALERTA!!! Valor potencialmente truncado detectado:", {
                codigo: element.dimConvenio.codigo,
                valorLiberado: element.valorLiberado,
                valorDaUltimaLiberacao: element.valorDaUltimaLiberacao,
                valor: element.valor,
                dataInicio: element.dataInicioVigencia
            });

            PortalAPI.portalAPILogger.warn(`ALERTA!!! Valor potencialmente truncado detectado: \n${JSON.stringify({
                codigo: element.dimConvenio.codigo,
                valorLiberado: element.valorLiberado,
                valorDaUltimaLiberacao: element.valorDaUltimaLiberacao,
                valor: element.valor,
                dataInicio: element.dataInicioVigencia
            })}`, "PortalAPI");

            element = await PortalAPI.geConveniosByCode(element.dimConvenio.codigo);

            if (!element) {
                console.log("[ClientPortalAPI.parseResponseToDTO] Não foi possível obter o detalhe do convênio:", element.dimConvenio.codigo);
                PortalAPI.portalAPILogger.error(`Não foi possível obter o detalhe do convênio: ${element.dimConvenio.codigo}`, "PortalAPI");
                return;
            }
        }

        const detailConvenioUrlTemplate = `https://portaldatransparencia.gov.br/convenios/${element.dimConvenio.codigo}`;
        const cnpjDesformatado = element.convenente.cnpjFormatado.replace(/\D/g, '');
        const convenenteNome = element.convenente.nome.toLowerCase().replace(/[\s\W]+/g, '-');
        const detailDestinationUrlTemplate = `https://portaldatransparencia.gov.br/pessoa-juridica/${cnpjDesformatado}-${convenenteNome}`;
        let convenente = new ConvenenteDTO({ name: element.convenente.nome.toLowerCase(), type: element.convenente.tipo.toLowerCase(), detailUrl: detailDestinationUrlTemplate });

        console.log(`Valores do convênio ${element.dimConvenio.codigo} antes da conversão:`, {
            valorOriginal: element.valor,
            tipoValorOriginal: typeof element.valor,
            valorLiberadoOriginal: element.valorLiberado,
            valorUltimaLiberacaoOriginal: element.valorDaUltimaLiberacao
        });

        PortalAPI.portalAPILogger.info(`Valores do convênio ${element.dimConvenio.codigo} antes da conversão: {
            valorOriginal: ${element.valor},
            tipoValorOriginal: ${typeof element.valor},
            valorLiberadoOriginal: ${element.valorLiberado},
            valorUltimaLiberacaoOriginal: ${element.valorDaUltimaLiberacao}
        }`, "PortalAPI");

        const totalValueReleased = normalizeValueNumber(element.valorLiberado);
        const valueLastRelease = normalizeValueNumber(element.valorDaUltimaLiberacao);
        const totalValue = normalizeValueNumber(element.valor);

        console.log(`Valores do convênio ${element.dimConvenio.codigo} após a conversão:`, {
            valorConvertido: totalValue,
            valorLiberadoConvertido: totalValueReleased,
            valorUltimaLiberacaoConvertido: valueLastRelease
        });

        PortalAPI.portalAPILogger.info(`Valores do convênio ${element.dimConvenio.codigo} após conversão: {
            valorConvertido: ${totalValue},
            valorLiberadoConvertido: ${totalValueReleased},
            valorUltimaLiberacaoConvertido: ${valueLastRelease}
        }`, "PortalAPI");

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
    PortalAPI.portalAPILogger.info(`Encontrados ${convenios.length} convênios da ife: ${ifesCode} \n${convenios}`, "PortalAPI");
    return convenios;
}

