import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../../database/postgresqlConfig";
import Convenio from "./Convenio";

class Convenente extends Model<InferAttributes<Convenente>, InferCreationAttributes<Convenente>> {
    declare id?: number;
    declare name: string;
    declare type: string;
    declare detailUrl: string;

    declare convenios?: Convenio[];
};

Convenente.init(
    {
        id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            field: 'id',
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            field: 'name',
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            field: 'type',
            allowNull: false
        },
        detailUrl: {
            type: DataTypes.STRING,
            field: 'detailUrl',
            allowNull: false
        },
    },
    {
        sequelize,
        modelName: 'Convenentes',
        tableName: 'Convenentes',
        timestamps: false
    }
);

export default Convenente;