import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../../database/postgresqlConfig";
import Convenio from "../domain/Convenio";

class Ifes extends Model<InferAttributes<Ifes>, InferCreationAttributes<Ifes>> {
    declare id?: number;
    declare code: string;
    declare acronym: string;
    declare name: string;

    declare convenios?: Convenio[]
}

Ifes.init(
    {
        id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        code: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        acronym: {
            type: DataTypes.STRING,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
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