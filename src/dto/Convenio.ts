import Convenio from "../models/Convenio";
import { getTimestamp } from "../utils/DateUtils";
import ConvenenteDTO from "./Convenente";

const dateKeys = [
  "startEffectiveDate",
  "endEffectiveDate",
  "lastReleaseDate"
];

const keys = [
  "ifesCode",
  "number",
  "description",
  "origin",
  "totalValueReleased",
  "startEffectiveDate",
  "endEffectiveDate",
  "lastReleaseDate",
  "valueLastRelease",
  "totalValue",
  "isPotentiallyTruncated",
];

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
 *       isPotentiallyTruncated:
 *          type: boolean
 *          description: Indica se o convênio pode estar truncado (valores abaixo de 10.000)
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
  isPotentiallyTruncated: boolean;

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
    this.isPotentiallyTruncated = data.isPotentiallyTruncated || false;
  }


  static fromEntity(convenio: Convenio | null): ConvenioDTO | null {
    if (!convenio) {
      return null;
    }

    return new ConvenioDTO({
      detailUrl: convenio.detailUrl,
      ifesCode: convenio.ifesCode,
      number: convenio.number,
      description: convenio.description,
      origin: convenio.origin,
      totalValueReleased: Number(convenio.totalValueReleased),
      startEffectiveDate: convenio.startEffectiveDate,
      endEffectiveDate: convenio.endEffectiveDate,
      lastReleaseDate: convenio.lastReleaseDate,
      valueLastRelease: Number(convenio.valueLastRelease),
      totalValue: Number(convenio.totalValue),
      convenenteId: convenio.convenenteId,
      convenente: convenio.convenente ? convenio.convenente : null,
      isPotentiallyTruncated: convenio.isPotentiallyTruncated || false
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

  equals(convenioCompare: ConvenioDTO): boolean {
    for (const key of keys) {
      if (dateKeys.includes(key)) {
        if (getTimestamp((this as any)[key]) !== getTimestamp((convenioCompare as any)[key])) {
          return false;
        }
      } else {
        if ((this as any)[key] !== (convenioCompare as any)[key]) {
          return false;
        }
      }
    }
    return true;
  }

  getDiff(convenioAntigo: ConvenioDTO): [{ [key: string]: any }, { [key: string]: any }, boolean] {
    const oldValues: { [key: string]: any } = {};
    const newValues: { [key: string]: any } = {};
    let isPotentiallyTruncated = false;

    for (const key of keys) {
      if (dateKeys.includes(key)) {
        const v1 = getTimestamp((this as any)[key]);
        const v2 = getTimestamp((convenioAntigo as any)[key]);
        if (v1 !== v2) {
          oldValues[key] = (convenioAntigo as any)[key];
          newValues[key] = (this as any)[key];
        }
      } else {
        if ((this as any)[key] !== (convenioAntigo as any)[key]) {
          oldValues[key] = (convenioAntigo as any)[key];
          newValues[key] = (this as any)[key];
        }
      }
    }

    // Regras de negócio adicionais:
    // - Só atualiza totalValue se o antigo estava truncado (< 10000) e o novo não está
    if (
      "totalValue" in oldValues &&
      (convenioAntigo.totalValue > 0 && convenioAntigo.totalValue < 10000) &&
      !(this.totalValue > 0 && this.totalValue < 10000)
    ) {
      // ok, mantém diferença
    } else if ("totalValue" in oldValues) {
      // Se não for caso de atualização, remove do diff
      delete oldValues["totalValue"];
      delete newValues["totalValue"];
    }

    // - Não atualiza se totalValueReleased diminuiu
    if (
      "totalValueReleased" in oldValues &&
      this.totalValueReleased < convenioAntigo.totalValueReleased
    ) {
      delete oldValues["totalValueReleased"];
      delete newValues["totalValueReleased"];
    }

    // - Não atualiza se valueLastRelease diminuiu
    if (
      "valueLastRelease" in oldValues &&
      this.valueLastRelease < convenioAntigo.valueLastRelease
    ) {
      delete oldValues["valueLastRelease"];
      delete newValues["valueLastRelease"];
    }

    // Flag de truncamento para qualquer campo relevante
    ["totalValue", "totalValueReleased", "valueLastRelease"].forEach((key) => {
      if (
        key in newValues &&
        typeof newValues[key] === "number" &&
        newValues[key] > 0 &&
        newValues[key] < 10000
      ) {
        isPotentiallyTruncated = true;
      }
    });

    return [newValues, oldValues, isPotentiallyTruncated];
  }
}
