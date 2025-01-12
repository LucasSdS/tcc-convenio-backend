export default class ConvenioDTO {
    detailUrl: string;
    ifesCode: string;
    number: string;
    description: string;
    origin: string;
    destination: string;
    totalValueReleased: number;
    destinationType: string;
    destinationDetailUrl: string;
    startEffectiveDate: Date;
    endEffectiveDate: Date;
    lastReleaseDate: Date;
    valueLastRelease: number;
    totalValue: number;

    constructor(
        detailUrl: string,
        ifesCode: string,
        number: string,
        description: string,
        origin: string,
        destination: string,
        totalValueReleased: number,
        destinationType: string,
        destinationDetailUrl: string,
        startEffectiveDate: Date,
        endEffectiveDate: Date,
        lastReleasedDate: Date,
        valueLastRelease: number,
        totalValue: number
    ) {
        this.detailUrl = detailUrl;
        this.ifesCode = ifesCode;
        this.number = number;
        this.description = description;
        this.origin = origin;
        this.destination = destination;
        this.totalValueReleased = totalValueReleased;
        this.destinationType = destinationType;
        this.destinationDetailUrl = destinationDetailUrl;
        this.startEffectiveDate = startEffectiveDate;
        this.endEffectiveDate = endEffectiveDate;
        this.lastReleaseDate = lastReleasedDate;
        this.valueLastRelease = valueLastRelease;
        this.totalValue = totalValue;
    }

}
