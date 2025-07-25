import BadRequestError from "../errors/BadRequestError";

/**
 * 
 * @param dateString no formato dd/mm/yyyy
 * @returns nova Data no formato Date
 */
export const buildDateOnly = (dateString: string): Date => {
    const regexData = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/([1-9]\d{3})$/;
    const match = dateString.match(regexData);

    if (match) {
        const [_, dia, mes, ano] = match as [_: string, dia: number, mes: number, ano: number];
        return new Date(ano, mes - 1, dia);
    } else {
        throw new BadRequestError(`Não foi possível construir a Data ${dateString}`);
    }
}

export const getTimestamp = (date: Date): number => {
    if (!date) return 0;
    if (date instanceof Date) return date.getTime();
    if (typeof date === 'string') return new Date(date).getTime();
    return 0;
}

/**
 * Verifica qual das datas é a mais recente
 * @param date1 primeira data
 * @param date2 segunda data
 * @returns a data mais recente
 */
export const getMostRecentDate = (date1: Date | null, date2: Date | null): Date => {
    if (!date1 && !date2) return new Date(0);
    if (!date1) return date2 as Date;
    if (!date2) return date1;

    return date1 > date2 ? date1 : date2;
}