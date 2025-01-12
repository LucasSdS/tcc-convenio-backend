import { Schema } from "mongoose";
import mongoose from "../../database/mongodbConfig";

interface IChangeLog  {
    id?: string;
    changeDate: Date;
    updatedBy: string;
    convenio: string;
    changes: Object[];
};

const changeLogSchema = new Schema<IChangeLog>({
    id: Schema.ObjectId,
    changeDate: { type: Date, required: true },
    updatedBy: { type: String, required: true },
    convenio: { type: String, required: true },
    changes: { type: [Object], required: true }
});

const ChangeLog = mongoose.model<IChangeLog>('ChangeLog', changeLogSchema)

export default ChangeLog;
