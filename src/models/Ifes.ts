import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../../database/postgresqlConfig";
import Convenio from "./Convenio";

class Ifes extends Model<InferAttributes<Ifes>, InferCreationAttributes<Convenio>> {
    id?: number;
    code: string;
    acronym: string;
    name: string;
};

Ifes.init(
    {
        id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            field: 'id',
            allowNull: false
        },
        code: {
            type: DataTypes.STRING,
            field: 'code'
        },
        acronym: {
            type: DataTypes.STRING,
            field: 'acronym'
        },
        name: {
            type: DataTypes.STRING,
            field: 'name'
        }
    },
    {
        sequelize,
        modelName: 'Ifes',
        tableName: 'Ifes',
        timestamps: false
    }
);

export default Ifes;