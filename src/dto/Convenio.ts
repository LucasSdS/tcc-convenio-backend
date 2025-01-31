import Convenio from "../models/Convenio";
import ConvenenteDTO from "./Convenente";

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
            convenente: convenio.convenente ? convenio.convenente : null
        });
    }

    static fromEntities(convenios: []) {
        return convenios ? convenios.map(convenio => ConvenioDTO.fromEntity(convenio)) : convenios;
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
            convenenteId: convenenteId
        }
    }

}
