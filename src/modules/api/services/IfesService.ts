import IfesConveniosValidation from "../validations/CompareIfesConveniosValidation";
import { buildDateOnly } from "../../../utils/DateUtils";
import ConveniosRepository from "../../../repositories/ConveniosRepository";
import ConvenioDTO from "../../../dto/Convenio";
import IfesComparadasDTO from "../dtos/IfesComparadas";
import IfesRepository from "../../../repositories/IfesRepository";
import ifesList from "../../../ifes.json";
import IfesRankingDTO from "../dtos/IfesRanking";
import BadRequestError from "../../../errors/BadRequestError";
import NotFoundError from "../../../errors/NotFoundError";

export default class IfesService {
    static async getAllIfes() {
        const allIfes = await IfesRepository.getAllIfes();
        if (!allIfes) {
            throw new NotFoundError("Ifes not found");
        }
        return allIfes;
    }

    static async getIfesByCode(ifesCode: string) {
        const ifes = await IfesRepository.getIfesByCode(ifesCode);
        if (!ifes) {
            throw new NotFoundError("Ifes not found");
        }
        return ifes;
    }

    static async compareIfesConvenios(ifesSelected: [], dataInicio: string, dataFim: string): Promise<any> {
        IfesConveniosValidation.validateIfesSelected(ifesSelected);
        IfesConveniosValidation.validateData(dataInicio);
        IfesConveniosValidation.validateData(dataFim);

        const dataInicioDate = buildDateOnly(dataInicio);
        const dataFimDate = buildDateOnly(dataFim);

        if (dataInicioDate > dataFimDate) {
            throw new BadRequestError(`Erro de validação: dataInicio ${dataInicio} não pode ser maior que dataFim ${dataFim}`);
        }

        // TODO: Fazer uma checagem para quando a dataInicio for maior que o ano de 2024 para utilizar um outro formato de busca em outro banco de dados onde utilizaremos uma tabela de acompanhamento mais detalhado dos convenios para registrar as parcelas repassadas pelas universidades de forma mais precisa


        // Maneira de comparação mais geral utilizando apenas os dados repassados pela API do portal que estão registradas no nosso BD
        let responseIfesConveniosComparados = [];
        for (let ifeSelected of ifesSelected) {
            const ifesEncontrada = await IfesRepository.getIfesByCode(ifeSelected);

            if (!ifesEncontrada) {
                throw new NotFoundError(`Erro: Não foi possível encontrar a universidade com código ${ifeSelected} no nosso Banco de Dados`);
            }

            const response = await ConveniosRepository.getAllConveniosByIfesCodeAndByPeriod(ifeSelected, dataInicioDate, dataFimDate);

            const conveniosFromIfeSelected = ConvenioDTO.fromEntities(response);
            const ifesComparadasDTO = new IfesComparadasDTO(ifesEncontrada.name, conveniosFromIfeSelected);
            responseIfesConveniosComparados.push(ifesComparadasDTO);
        }

        return responseIfesConveniosComparados;
    }

    static async createIfesOnDatabase() {
        const ifesCodePersisted = (await IfesRepository.getAllIfes()).map(ifes => ifes.code);
        let ifesListDTOToInsert = ifesList.ifes.filter(ifes => !ifesCodePersisted.includes(ifes.code));

        if (ifesListDTOToInsert.length > 0) {
            await IfesRepository.bulkCreateIfes(ifesListDTOToInsert);
        }
    }


    /**
     * Método responsavel por buscar pela tabela de Ifes o nome, e seus respectivos convenios e convenentes
     * Retornar um array completo de ifesRankingDTO
     * 
     * @param ifesRankingPartial 
     * @param startYear 
     * @param endYear 
     */
    static async getIfesRanking(ifesRankingPartial: IfesRankingDTO[], startYear: Date, endYear: Date) {
        const ifesRankingCode = ifesRankingPartial.map(ifes => ifes.code);
        const ifesResponseEntityWithConveniosAndConvenentes = await IfesRepository.getAllIfesWithTotalValueReleasedsConvenios(ifesRankingCode, startYear, endYear);

        const groupConvenentesByConvenios = ifesResponseEntityWithConveniosAndConvenentes.map(ifes => {
            let convenentesAgrupados: any[] = [];
            ifes.convenios?.forEach((convenio: any) => {
                if (convenio.convenente) {
                    let convenenteExiste = convenentesAgrupados.find(convenente => convenente.name === convenio.convenente.name);
                    if (convenenteExiste) {
                        convenenteExiste.totalValueReleased += convenio.totalValueReleased || 0;
                    } else {
                        convenentesAgrupados.push({
                            name: convenio.convenente.name,
                            detailUrl: convenio.convenente.detailUrl,
                            totalValueReleased: convenio.totalValueReleased
                        });
                    }
                }
            });

            const convenentesAgrupadosFormatados = convenentesAgrupados.map(convenente => {
                return {
                    name: convenente.name,
                    detailUrl: convenente.detailUrl,
                    totalValueReleased: parseFloat(convenente.totalValueReleased.toFixed(2))
                }
            });

            const convenentesAgrupadosFormatadosOrdenados = convenentesAgrupadosFormatados.sort((a, b) => (b.totalValueReleased ?? 0) - (a.totalValueReleased ?? 0));

            const ifesTotalValueReleased = ifesRankingPartial.find(ifesPartial => {
                if (ifesPartial.code === ifes.code) {
                    return parseFloat(ifesPartial.totalValueReleased.toFixed(2));
                }
            });

            return {
                code: ifes.code,
                name: ifes.name,
                totalValueReleased: ifesTotalValueReleased?.totalValueReleased,
                convenentes: convenentesAgrupadosFormatadosOrdenados
            }
        });

        const groupConvenentesByConveniosSorted = groupConvenentesByConvenios.sort((a, b) => (b.totalValueReleased ?? 0) - (a.totalValueReleased ?? 0));

        return IfesRankingDTO.fromPartialIfesRankingEntities(groupConvenentesByConveniosSorted);
    }
}