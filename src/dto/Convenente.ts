import Convenente from "../models/Convenente";

export default class ConvenenteDTO {
    name: string;
    type: string;
    detailUrl: string;

    constructor(data: any) {
        this.name = data.name;
        this.type = data.type;
        this.detailUrl = data.detailUrl;
    }

    static fromEntity(entity: Convenente) {
        return new ConvenenteDTO(entity);
    }

    static fromEntities(entities: Convenente[]) {
        return entities.map(entity => ConvenenteDTO.fromEntity(entity));
    }

    toEntity() {
        return {
            name: this.name,
            type: this.type,
            detailUrl: this.detailUrl
        }
    }
}