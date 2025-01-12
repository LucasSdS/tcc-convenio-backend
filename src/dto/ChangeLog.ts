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
}
