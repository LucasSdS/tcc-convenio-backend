import Convenio from "../domain/Convenio";

/**
 * @swagger
 * components:
 *   schemas:
 *     ConvenioUI:
 *       type: object
 *       properties:
 *         number:
 *           type: string
 *           description: Numero do convênio
 *         detailUrl:
 *           type: string
 *           description: URL com detalhes do convênio
 *         description:
 *           type: string
 *           description: Descrição do convênio
 *         origin:
 *           type: string
 *           description: Origem do convênio
 *         totalValueReleased:
 *           type: number
 *           description: Valor total liberado
 *         totalValue:
 *           type: number
 *           description: Valor total do convênio
 *         valueLastRelease:
 *           type: number
 *           description: Valor da última liberação
 *         startEffectiveDate:
 *           type: string
 *           format: date
 *           description: Data de início da vigência
 *         endEffectiveDate:
 *           type: string
 *           format: date
 *           description: Data do fim da vigência
 *         lastReleaseDate:
 *           type: string
 *           format: date
 *           description: Data da última liberação
 *         destination:
 *           type: string
 *           description: Nome do convenente (destino)
 *         destinationType:
 *           type: string
 *           description: Tipo do convenente
 *         destinationDetailUrl:
 *           type: string
 *           description: URL com detalhes do convenente
 *         acronym:
 *           type: string
 *           description: Sigla da universidade (IFES)
 *       required:
 *         - number
 *         - detailUrl
 *         - description
 *         - origin
 *         - totalValueReleased
 *         - totalValue
 *         - valueLastRelease
 *         - startEffectiveDate
 *         - endEffectiveDate
 *         - lastReleaseDate
 *         - destination
 *         - destinationType
 *         - destinationDetailUrl
 *         - acronym
 */
export default class ConvenioUIDTO {
    number: string;
    detailUrl: string;
    description: string;
    origin: string;
    totalValueReleased: number;
    totalValue: number;
    valueLastRelease: number;
    startEffectiveDate: Date;
    endEffectiveDate: Date;
    lastReleaseDate: Date;
    destination: string;
    destinationType: string;
    destinationDetailUrl: string;
    acronym: string;

    constructor(data: any) {
        this.number = data.number;
        this.detailUrl = data.detailUrl;
        this.description = data.description;
        this.origin = data.origin;
        this.totalValueReleased = data.totalValueReleased;
        this.totalValue = data.totalValue;
        this.valueLastRelease = data.valueLastRelease;
        this.startEffectiveDate = data.startEffectiveDate;
        this.endEffectiveDate = data.endEffectiveDate;
        this.lastReleaseDate = data.lastReleaseDate;
        this.destination = data.destination;
        this.destinationType = data.destinationType;
        this.destinationDetailUrl = data.destinationDetailUrl;
        this.acronym = data.acronym;
    }

    /**
     * Converte uma entidade Convenio (com relacionamentos) em ConvenioUIDTO
     * @param convenio Entidade Convenio com includes de convenente e ifes
     * @returns ConvenioUIDTO ou null
     */
    static fromEntity(convenio: Convenio | null): ConvenioUIDTO | null {
        if (!convenio) {
            return null;
        }

        return new ConvenioUIDTO({
            number: convenio.number,
            detailUrl: convenio.detailUrl,
            description: convenio.description,
            origin: convenio.origin,
            totalValueReleased: Number(convenio.totalValueReleased),
            totalValue: Number(convenio.totalValue),
            valueLastRelease: Number(convenio.valueLastRelease),
            startEffectiveDate: convenio.startEffectiveDate,
            endEffectiveDate: convenio.endEffectiveDate,
            lastReleaseDate: convenio.lastReleaseDate,
            destination: convenio.convenente?.name || '',
            destinationType: convenio.convenente?.type || '',
            destinationDetailUrl: convenio.convenente?.detailUrl || '',
            acronym: convenio.ifes?.acronym || ''
        });
    }

    /**
     * Converte um array de entidades Convenio em array de ConvenioUIDTO
     * @param convenios Array de entidades Convenio
     * @returns Array de ConvenioUIDTO
     */
    static fromEntities(convenios: Convenio[]): ConvenioUIDTO[] {
        return convenios.map(convenio => ConvenioUIDTO.fromEntity(convenio)).filter(dto => dto !== null) as ConvenioUIDTO[];
    }
}