import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../../database/postgresqlConfig";

class Convenio extends Model<InferAttributes<Convenio>, InferCreationAttributes<Convenio>> {
    id?: number;
    detailUrl: string;
    ifesCode: string;
    number: string;
    description: string;
    origin: string;
    totalValueReleased: number;
    destination: string;
    destinationType: string;
    destinationDetailUrl: string;
    startEffectiveDate: Date;
    endEffectiveDate: Date;
    lastReleaseDate: Date;
    valueLastRelease: number;
    totalValue: number;
};

Convenio.init(
    {
        id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            field: 'id',
            allowNull: false,
            autoIncrement: true
        },
        detailUrl: {
            type: DataTypes.STRING,
            field: 'detailURL'
        },
        ifesCode: {
            type: DataTypes.STRING,
            field: 'ifesCode',
            allowNull: false
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
            type: DataTypes.DOUBLE,
            field: 'totalValueReleased'
        },
        destination: {
            type: DataTypes.STRING,
            field: 'destination'
        },
        destinationType: {
            type: DataTypes.STRING,
            field: 'destinationType'
        },
        destinationDetailUrl: {
            type: DataTypes.STRING,
            field: 'destinationDetailUrl'
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
            type: DataTypes.DOUBLE,
            field: 'valueLastRelease'
        },
        totalValue: {
            type: DataTypes.DOUBLE,
            field: 'totalValue'
        }
    },
    {
        sequelize,
        modelName: 'Convenios',
        tableName: 'Convenios',
        timestamps: false
    }
);

export default Convenio;