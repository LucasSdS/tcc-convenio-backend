import ConvenioDTO from "./Convenio";

export default class ChangeLogDTO {
    changeDate: Date;
    updatedBy: string;
    convenio: string;
    changes: Object[];

    constructor(
        changeDate: Date,
        updatedBy: string,
        convenio: string,
        changes: Object[]
    ) {
        this.changeDate = changeDate;
        this.updatedBy = updatedBy;
        this.convenio = convenio;
        this.changes = changes;
    }

    static generateChangeLogDTOByDiff(convenio1: ConvenioDTO, convenio2: ConvenioDTO, diffKeys: Array<keyof typeof convenio1>): ChangeLogDTO  {
        const changes: Object[] = []
    
        diffKeys.forEach(key => {
            changes.push({ [key]: {
                previousValue: convenio2[key],
                newValue: convenio1[key]
            }})
        });
    
        return new ChangeLogDTO(
            new Date(Date.now()),
            'Automatic Update',
            convenio1.number,
            changes,
        )
    }
}