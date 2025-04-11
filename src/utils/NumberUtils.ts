
export const normalizeValueNumber = (value: any): number => {
    if (value === undefined || value === null || value === '') return 0.00;

    let result: number;

    if (typeof value === 'number') {
        result = value;
    } else if (typeof value === 'string') {
        if (value.includes(',')) {
            result = Number(value.replace(/\./g, '').replace(',', '.'));
        } else {
            result = Number(value);
        }
    } else {
        result = 0.00;
    }

    if (isNaN(result)) {
        console.warn(`Erro ao converter valor para número: "${value}"`);
        return 0.00;
    }

    return Number(result.toFixed(2));
}
