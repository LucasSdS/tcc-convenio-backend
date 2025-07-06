import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../config/postgresqlConfig";
import Ifes from "../domain/Ifes";
import Convenente from "./Convenente";

class Convenio extends Model<InferAttributes<Convenio>, InferCreationAttributes<Convenio>> {
    declare id?: number;
    declare detailUrl: string;
    declare ifesCode: string;
    declare number: string;
    declare description: string;
    declare origin: string;
    declare totalValueReleased: number;
    declare startEffectiveDate: Date;
    declare endEffectiveDate: Date;
    declare lastReleaseDate: Date;
    declare valueLastRelease: number;
    declare totalValue: number;
    declare convenenteId: number;

    declare ifes?: Ifes;
    declare convenente?: Convenente;

    declare isPotentiallyTruncated?: boolean;
};

Convenio.init(
    {
        id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            field: 'id',
            allowNull: false,
            autoIncrement: true,
            unique: true
        },
        detailUrl: {
            type: DataTypes.STRING,
            field: 'detailURL'
        },
        ifesCode: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'Ifes',
                key: 'code'
            }
        },
        'number': {
            type: DataTypes.STRING,
            field: 'number'
        },
        description: {
            type: DataTypes.TEXT,
            field: 'description'
        },
        origin: {
            type: DataTypes.STRING,
            field: 'origin'
        },
        totalValueReleased: {
            type: DataTypes.DECIMAL(20, 2),
            field: 'totalValueReleased'
        },
        startEffectiveDate: {
            type: DataTypes.DATEONLY,
            field: 'startEffectiveDate'
        },
        endEffectiveDate: {
            type: DataTypes.DATEONLY,
            field: 'endEffectiveDate'
        },
        lastReleaseDate: {
            type: DataTypes.DATEONLY,
            field: 'lastReleaseDate'
        },
        valueLastRelease: {
            type: DataTypes.DECIMAL(20, 2),
            field: 'valueLastRelease'
        },
        totalValue: {
            type: DataTypes.DECIMAL(20, 2),
            field: 'totalValue'
        },
        convenenteId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Convenentes',
                key: 'id'
            }
        },
        isPotentiallyTruncated: {
            type: DataTypes.BOOLEAN,
            field: 'isPotentiallyTruncated',
            defaultValue: false
        }
    },
    {
        sequelize,
        modelName: 'Convenios',
        tableName: 'Convenios',
        timestamps: true,
    }
);

export default Convenio;