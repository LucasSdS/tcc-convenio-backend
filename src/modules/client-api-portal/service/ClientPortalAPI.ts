import axios from "axios";
import ConvenioDTO from "../../../dto/Convenio";
import ChangeLogDTO from "../../../dto/ChangeLog";
import ifesList from "../../../../src/ifes.json";
import { ConveniosRepository } from "../../../services/ConvenioService";
import { ChangeLogRepository } from "../../../services/ChangeLogService";

export default class PortalAPI {
    static async call(ifesCode: string, year: string, page: number): Promise<ConvenioDTO[]> {
        const urlTemplate = `https://api.portaldatransparencia.gov.br/api-de-dados/convenios?codigoOrgao=${ifesCode}&pagina=${page}&dataUltimaLiberacaoInicial=01/01/${year}&dataUltimaLiberacaoFinal=31/12/${year}`;
        try {
            const response = await axios(urlTemplate, {
                headers: {
                    "chave-api-dados": process.env.APIKEY
                },
                responseType: "json"
            });

            return parseResponseToDTO(response.data, ifesCode);
        } catch (error: any) {
            console.error(error.name, error.message);
            throw error;
        }
    }

    static async updateAllConvenios() {
        await Promise.all(ifesList.ifes.map(async (ifes) => {
            await this.updateConvenio(ifes.code)
        }));
    }

    static async updateConvenio(ifesCode: string): Promise<void> {
        let currYear = new Date().getFullYear();
        let cycleYear = true;
        while (cycleYear) {
            let conveniosByYear: ConvenioDTO[] = [];
            let page = 1;
            let response = await this.call(ifesCode, currYear.toString(), page);
            conveniosByYear = conveniosByYear.concat(response);
            while (response.length) {
                page++;
                response = await this.call(ifesCode, currYear.toString(), page);
                conveniosByYear = conveniosByYear.concat(response);
            }
            if (!response.length && page === 1) cycleYear = false
            await this.compareAndUpdateConvenios(conveniosByYear)
            currYear--;
        }
    }

    static async compareAndUpdateConvenios(convenios: ConvenioDTO[]): Promise<void> {
        const conveniosToCreate: ConvenioDTO[] = [];
        for (const convenio of convenios) {
            const dbConvenio = await ConveniosRepository.getConvenioByNumber(convenio.number);
            if (!dbConvenio) {
                console.log('add to creation', convenio.number)
                conveniosToCreate.push(convenio)
            } else if (!isConvenioEqual(convenio, dbConvenio)) {
                const diff = getConvenioDiff(convenio, dbConvenio);
                const log = generateChangeLogDTO(convenio, dbConvenio, diff as Array<keyof typeof convenio>)
                await ConveniosRepository.updateConvenio(convenio);
                await ChangeLogRepository.createLogEntry(log);
            } else {
                console.log('Not able to create/update convenio', convenio.number)
            }
        }
        console.log(conveniosToCreate.length)
        await ConveniosRepository.bulkCreateConvenio(conveniosToCreate);
    }

}

const parseResponseToDTO = (response: any[], ifesCode: string): ConvenioDTO[] => {
    let convenios: ConvenioDTO[] = [];

    response.forEach((element: any) => {
        const detailConvenioUrlTemplate = `https://portaldatransparencia.gov.br/convenios/${element.dimConvenio.codigo}`;

        const cnpjDesformatado = element.convenente.cnpjFormatado.replace(/\D/g, '');
        const convenenteNome = element.convenente.nome.toLowerCase().replace(/[\s\W]+/g, '-');
        const detailDestinationUrlTemplate = `https://portaldatransparencia.gov.br/convenios/${element.dimConvenio.codigo}/pessoa-juridica/${cnpjDesformatado}-${convenenteNome}`;

        let convenio = new ConvenioDTO(
            detailConvenioUrlTemplate,
            ifesCode,
            element.dimConvenio.codigo,
            element.dimConvenio.objeto,
            element.unidadeGestora.orgaoVinculado.nome,
            element.convenente.nome.toLowerCase(),
            element.valorLiberado,
            element.convenente.tipo.toLowerCase(),
            detailDestinationUrlTemplate,
            element.dataInicioVigencia,
            element.dataFinalVigencia,
            element.dataUltimaLiberacao,
            element.valorDaUltimaLiberacao,
            element.valor
        );
        convenios.push(convenio);
    });

    return convenios;
}

const isConvenioEqual = (convenio1: ConvenioDTO, convenio2: ConvenioDTO): Boolean => {
    const c1keys = Object.keys(convenio1) as Array<keyof typeof convenio1>;
    const c2keys = Object.keys(convenio2);

    if (c1keys.length != c2keys.length) {
        return false;
    }

    for (let key of c1keys) {
        if (convenio1[key] !== convenio2[key]) {
            return false;
        }
    }
    return true;
}

const getConvenioDiff = (convenio1: ConvenioDTO, convenio2: ConvenioDTO): String[] => {
    const c1keys = Object.keys(convenio1) as Array<keyof typeof convenio1>;
    const diffKeys: string[] = [];

    for (let key of c1keys) {
        if (convenio1[key] !== convenio2[key]) {
            diffKeys.push(key)
        }
    }

    return diffKeys;
}

const generateChangeLogDTO = (convenio1: ConvenioDTO, convenio2: ConvenioDTO, diffKeys: Array<keyof typeof convenio1>): ChangeLogDTO  => {
    const changes: Object[] = []

    diffKeys.forEach(key => {
        changes.push({ [key]: {
            previousValue: convenio2[key],
            newValue: convenio1[key]
        }})
    });

    return new ChangeLogDTO(
        new Date(Date.now()),
        'Automatic Update',
        convenio1.number,
        changes,
    )
}
