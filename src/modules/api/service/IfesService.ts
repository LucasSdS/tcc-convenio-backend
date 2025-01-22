import IfesConveniosValidation from "../validations/CompareIfesConveniosValidation";
import { buildDateOnly } from "../../../utils/DateUtils";
import ConveniosRepository from "../../../repositories/ConveniosRepository";
import ConvenioDTO from "../../../dto/Convenio";
import IfesComparadasDTO from "../dto/IfesComparadas";
import IfesRepository from "../../../repositories/IfesRepository";
import ifesList from "../../../ifes.json";
import IfesDTO from "../../../dto/Ifes";

export default class IfesService {
    static async compareIfesConvenios(ifesSelected: [], dataInicio: string, dataFim: string): Promise<any> {
        IfesConveniosValidation.validateIfesSelected(ifesSelected);
        IfesConveniosValidation.validateData(dataInicio);
        IfesConveniosValidation.validateData(dataFim);

        const dataInicioDate = buildDateOnly(dataInicio);
        const dataFimDate = buildDateOnly(dataFim);

        if (dataInicioDate > dataFimDate) {
            throw new Error(`Erro de validação dataInicio ${dataInicio} não pode ser maior que dataFim ${dataFim}`);
        }

        // TODO: Fazer uma checagem para quando a dataInicio for maior que o ano de 2024 para utilizar um outro formato de busca em outro banco de dados onde utilizaremos uma tabela de acompanhamento mais detalhado dos convenios para registrar as parcelas repassadas pelas universidades de forma mais precisa


        // Maneira de comparação mais geral utilizando apenas os dados repassados pela API do portal que estão registradas no nosso BD
        let responseIfesConveniosComparados = [];
        for (let ifeSelected of ifesSelected) {
            const ifesEncontrada = await IfesRepository.getIfesByCode(ifeSelected);

            if (!ifesEncontrada) {
                throw new Error(`Erro: Não foi possível encontrar a universidade com código ${ifeSelected} no nosso Banco de Dados`);
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

}