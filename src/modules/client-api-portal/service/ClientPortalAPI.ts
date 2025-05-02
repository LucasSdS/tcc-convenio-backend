import axios from "axios";
import ConvenioDTO from "../../../dto/Convenio";
import ConvenenteDTO from "../../../dto/Convenente";
import { normalizeValueNumber } from "../../../utils/NumberUtils";
import { logger } from "../../../utils/ContextLogger";
import { parse } from "path";

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

            if (response.status !== 200) {
                console.log("[PortalAPI.getConveniosByYear] Erro ao buscar convênios da universidade com código", ifesCode, " no ano:", year, "paginacao: ", page);
                this.portalAPILogger.error(`Erro ao buscar convênios da universidade com código ${ifesCode} no ano: ${year} paginacao: ${page}`, "PortalAPI");
                throw new Error(`Erro ao buscar convênios da universidade com código ${ifesCode} no ano: ${year} paginacao: ${page}`);
            }

            const convenios = response.data.map((element: any) => {
                return parseResponseToDTO(element, ifesCode);
            });

            return convenios;
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
            this.portalAPILogger.info(`Resposta da API de detalhe do convenio com código: ${code} - \nresposta: ${JSON.stringify(response.data)}`, "PortalAPI");

            if (response.data && response.data.length > 0) {
                const convenio = response.data[0];
                return parseResponseToDTO(convenio, convenio.orgao.codigoSIAFI);
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

const parseResponseToDTO = (convenio: any, ifesCode: string): ConvenioDTO | null => {

    if (checkValueIsUnder10000(convenio)) {
        console.log("[ClientPortalAPI.parseResponseToDTO] ALERTA!!! Valor potencialmente truncado detectado:", {
            codigo: convenio.dimConvenio.codigo,
            valorLiberado: convenio.valorLiberado,
            valorDaUltimaLiberacao: convenio.valorDaUltimaLiberacao,
            valor: convenio.valor,
            dataInicio: convenio.dataInicioVigencia
        });

        PortalAPI.portalAPILogger.warn(`ALERTA!!! Valor potencialmente truncado detectado: \n${JSON.stringify({
            codigo: convenio.dimConvenio.codigo,
            valorLiberado: convenio.valorLiberado,
            valorDaUltimaLiberacao: convenio.valorDaUltimaLiberacao,
            valor: convenio.valor,
            dataInicio: convenio.dataInicioVigencia
        })}`, "PortalAPI");

        // convenio = await PortalAPI.geConveniosByCode(convenio.dimConvenio.codigo);

        // if (!convenio) {
        //     console.log("[ClientPortalAPI.parseResponseToDTO] Não foi possível obter o detalhe do convênio:", convenio.dimConvenio.codigo);
        //     PortalAPI.portalAPILogger.error(`Não foi possível obter o detalhe do convênio: ${convenio.dimConvenio.codigo}`, "PortalAPI");
        //     return null;
        // }
    }

    const detailConvenioUrlTemplate = `https://portaldatransparencia.gov.br/convenios/${convenio.dimConvenio.codigo}`;
    const cnpjDesformatado = convenio.convenente.cnpjFormatado.replace(/\D/g, '');
    const convenenteNome = convenio.convenente.nome.toLowerCase().replace(/[\s\W]+/g, '-');
    const detailDestinationUrlTemplate = `https://portaldatransparencia.gov.br/pessoa-juridica/${cnpjDesformatado}-${convenenteNome}`;
    let convenente = new ConvenenteDTO({ name: convenio.convenente.nome.toLowerCase(), type: convenio.convenente.tipo.toLowerCase(), detailUrl: detailDestinationUrlTemplate });

    console.log(`Valores do convênio ${convenio.dimConvenio.codigo} da API:`, {
        valorOriginal: convenio.valor,
        tipoValorOriginal: typeof convenio.valor,
        valorLiberadoOriginal: convenio.valorLiberado,
        valorUltimaLiberacaoOriginal: convenio.valorDaUltimaLiberacao
    });

    PortalAPI.portalAPILogger.info(`Valores do convênio ${convenio.dimConvenio.codigo} da API: {
        valorOriginal: ${convenio.valor},
        tipoValorOriginal: ${typeof convenio.valor},
        valorLiberadoOriginal: ${convenio.valorLiberado},
        valorUltimaLiberacaoOriginal: ${convenio.valorDaUltimaLiberacao}
    }`, "PortalAPI");

    const totalValueReleased = normalizeValueNumber(convenio.valorLiberado);
    const valueLastRelease = normalizeValueNumber(convenio.valorDaUltimaLiberacao);
    const totalValue = normalizeValueNumber(convenio.valor);

    console.log(`Valores do convênio ${convenio.dimConvenio.codigo} após a conversão:`, {
        valorConvertido: totalValue,
        valorLiberadoConvertido: totalValueReleased,
        valorUltimaLiberacaoConvertido: valueLastRelease
    });

    PortalAPI.portalAPILogger.info(`Valores do convênio ${convenio.dimConvenio.codigo} após conversão: {
        valorConvertido: ${totalValue},
        valorLiberadoConvertido: ${totalValueReleased},
        valorUltimaLiberacaoConvertido: ${valueLastRelease}
    }`, "PortalAPI");

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

