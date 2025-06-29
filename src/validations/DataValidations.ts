import BadRequestError from "../../../errors/BadRequestError";

export default class DataValidations {

    /**
     * @param data no formato "dd/mm/yyyy"
     * @returns void ou error
     */
    static validateData(data: string) {
        const regexData = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/([1-9]\d{3})$/;
        if (!regexData.test(data)) {
            throw new BadRequestError(`Erro ao validar o campo data ${data}`);
        }
    }
}