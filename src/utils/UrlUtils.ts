/**
 * Utilitários para manipulação de URLs e query parameters
 */
export class UrlUtils {
    /**
     * Decodifica parâmetros de query string que podem conter caracteres especiais
     * Converte URL encoding (ex: "Teste+filtro+com+espa%C3%A7o") para texto normal ("Teste filtro com espaço")
     * 
     * @param queryParams - Objeto com parâmetros de query
     * @returns Objeto com parâmetros decodificados
     */
    static decodeQueryParams(queryParams: Record<string, any>): Record<string, any> {
        const decodedParams: Record<string, any> = {};
        
        Object.keys(queryParams).forEach(key => {
            const value = queryParams[key];
            if (typeof value === 'string') {
                decodedParams[key] = decodeURIComponent(value.replace(/\+/g, ' '));
            } else {
                decodedParams[key] = value;
            }
        });
        
        return decodedParams;
    }

    /**
     * Decodifica uma única string que pode conter URL encoding
     * 
     * @param encodedString - String com encoding
     * @returns String decodificada
     */
    static decodeUrlString(encodedString: string): string {
        if (typeof encodedString !== 'string') {
            return encodedString;
        }
        
        try {
            return decodeURIComponent(encodedString.replace(/\+/g, ' '));
        } catch (error) {
            console.warn('Erro ao decodificar string:', encodedString, error);
            return encodedString;
        }
    }

    /**
     * Limpa e sanitiza parâmetros de filtro removendo caracteres indesejados
     * 
     * @param filters - Objeto com filtros
     * @returns Objeto com filtros limpos
     */
    static sanitizeFilters(filters: Record<string, any>): Record<string, any> {
        const sanitizedFilters: Record<string, any> = {};
        
        Object.keys(filters).forEach(key => {
            const value = filters[key];
            if (typeof value === 'string') {
                const cleanValue = value.trim().replace(/[\x00-\x1F\x7F]/g, '');
                if (cleanValue) {
                    sanitizedFilters[key] = cleanValue;
                }
            } else if (value !== undefined && value !== null && value !== '') {
                sanitizedFilters[key] = value;
            }
        });
        
        return sanitizedFilters;
    }
}

export default UrlUtils;
