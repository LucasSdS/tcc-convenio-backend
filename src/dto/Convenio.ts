import Convenio from "../models/Convenio";
import ConvenenteRepository from "../repositories/ConvenenteRepository";
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

    static isConvenioEqual(convenio1: ConvenioDTO, convenio2: ConvenioDTO): Boolean {
        const c1keys = Object.keys(convenio1) as Array<keyof typeof convenio1>;
        const c2keys = Object.keys(convenio2);
    
        if (c1keys.length != c2keys.length) {
            return false;
        }
    
        for (let key of c1keys) {
            if (convenio1[key] !== convenio2[key]) {
                return false;
            }
        }
        return true;
    }
    
    static getConvenioDiff(convenio1: ConvenioDTO, convenio2: ConvenioDTO): String[] {
        const c1keys = Object.keys(convenio1) as Array<keyof typeof convenio1>;
        const diffKeys: string[] = [];
    
        for (let key of c1keys) {
            if (convenio1[key] !== convenio2[key]) {
                diffKeys.push(key)
            }
        }
        return diffKeys;
    }

}
