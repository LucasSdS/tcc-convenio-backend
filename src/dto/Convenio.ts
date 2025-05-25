import Convenio from "../models/Convenio";
import ConvenenteDTO from "./Convenente";

/**
 * @swagger
 * components:
 *   schemas:
 *     Convenio:
 *       type: object
 *       properties:
 *         detailUrl:
 *           type: string
 *           description: URL com detalhes do convênio
 *         ifesCode:
 *           type: string
 *           description: Código da Ifes associada
 *         number:
 *           type: string
 *           description: Número identificador do convênio
 *         description:
 *           type: string
 *           description: Descrição do convênio
 *         origin:
 *           type: string
 *           description: Origem do convênio
 *         totalValueReleased:
 *           type: number
 *           description: Valor total liberado
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
 *         valueLastRelease:
 *           type: number
 *           description: Valor da última liberação
 *         totalValue:
 *           type: number
 *           description: Valor total do convênio
 *         convenenteId:
 *           type: integer
 *           description: ID do convenente associado
 *         convenente:
 *           $ref: '#/components/schemas/Convenente'
 *           description: Dados do convenente associado
 *       required:
 *         - detailUrl
 *         - ifesCode
 *         - number
 *         - description
 *         - origin
 *         - totalValueReleased
 *         - startEffectiveDate
 *         - endEffectiveDate
 */
export default class ConvenioDTO {
  detailUrl: string;
  ifesCode: string;
  number: string;
  description: string;
  origin: string;
  totalValueReleased: number;
  startEffectiveDate: Date;
  endEffectiveDate: Date;
  lastReleaseDate: Date;
  valueLastRelease: number;
  totalValue: number;
  convenenteId: number;
  convenente: ConvenenteDTO;

  constructor(data: any) {
    this.detailUrl = data.detailUrl;
    this.ifesCode = data.ifesCode;
    this.number = data.number;
    this.description = data.description;
    this.origin = data.origin;
    this.totalValueReleased = data.totalValueReleased;
    this.startEffectiveDate = data.startEffectiveDate;
    this.endEffectiveDate = data.endEffectiveDate;
    this.lastReleaseDate = data.lastReleaseDate;
    this.valueLastRelease = data.valueLastRelease;
    this.totalValue = data.totalValue;
    if (data.convenenteId) {
      this.convenenteId = data.convenenteId;
    }
    if (data.convenente) {
      this.convenente = new ConvenenteDTO(data.convenente);
    }
  }

  static fromEntity(convenio: Convenio) {
    return new ConvenioDTO({
      detailUrl: convenio.detailUrl,
      ifesCode: convenio.ifesCode,
      number: convenio.number,
      description: convenio.description,
      origin: convenio.origin,
      totalValueReleased: convenio.totalValueReleased,
      startEffectiveDate: convenio.startEffectiveDate,
      endEffectiveDate: convenio.endEffectiveDate,
      lastReleaseDate: convenio.lastReleaseDate,
      valueLastRelease: convenio.valueLastRelease,
      totalValue: convenio.totalValue,
      convenenteId: convenio.convenenteId,
      convenente: convenio.convenente ? convenio.convenente : null,
    });
  }

  static fromEntities(convenios: []) {
    return convenios
      ? convenios.map((convenio) => ConvenioDTO.fromEntity(convenio))
      : convenios;
  }

  toEntity(convenenteId: any): any {
    return {
      detailUrl: this.detailUrl,
      ifesCode: this.ifesCode,
      number: this.number,
      description: this.description,
      origin: this.origin,
      totalValueReleased: this.totalValueReleased,
      startEffectiveDate: this.startEffectiveDate,
      endEffectiveDate: this.endEffectiveDate,
      lastReleaseDate: this.lastReleaseDate,
      valueLastRelease: this.valueLastRelease,
      totalValue: this.totalValue,
      convenenteId: convenenteId,
    };
  }

  equals(
    convenioCompare: ConvenioDTO,
  ): Boolean {
    const thisKeys = Object.keys(this) as Array<keyof ConvenioDTO>;
    const compareKeys = Object.keys(convenioCompare);

    if (thisKeys.length != compareKeys.length) {
      return false;
    }

    for (let key of thisKeys) {
      if (this[key] !== convenioCompare[key]) {
        return false;
      }
    }
    return true;
  }

  getDiffKeys(
    convenioCompare: ConvenioDTO,
  ): String[] {
    const c1keys = Object.keys(this) as Array<keyof ConvenioDTO>;
    const diffKeys: string[] = [];

    for (let key of c1keys) {
      if (this[key] !== convenioCompare[key]) {
        diffKeys.push(key);
      }
    }
    return diffKeys;
  }
}
