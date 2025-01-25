import DataValidations from "./DataValidations";

export default class IfesConveniosValidation {

    /**
     * @param data no formato "dd/mm/yyyy"
     * @returns void ou error
     */
    static validateData(data: string): any {
        if (data === null || data === undefined || data.length < 10) {
            throw new Error(`Erro ao validar o campo data ${data}`);
        }

        DataValidations.validateData(data);
    }

    /**
     * 
     * @param ifesSelected no formato: [ "ifesCode", "anotherIfesCode", "anotherIfesCode" ]
     * @returns void ou error
     */
    static validateIfesSelected(ifesSelected: []): any {
        if (ifesSelected === null || ifesSelected === undefined || ifesSelected.length <= 1) {
            throw new Error(`Erro ao validar campo ifesSelected ${ifesSelected} - está vazio ou nulo ou apenas uma universidade selecionada`)
        }

        const ifesSelectedSet = new Set(ifesSelected);
        if (ifesSelectedSet.size !== ifesSelected.length) {
            throw new Error(`Erro ao validar campo ifesSelected ${ifesSelected} - possui codigos iguais`)
        }

    }
}