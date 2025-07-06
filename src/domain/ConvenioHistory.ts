import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/postgresqlConfig";

interface ConvenioHistoryAttributes {
    id?: number;
    convenioId: number;
    updatedAt: Date;
    oldValues: object;
    newValues: object;
}

interface ConvenioHistoryCreationAttributes extends Optional<ConvenioHistoryAttributes, "id"> { }

class ConvenioHistory extends Model<ConvenioHistoryAttributes, ConvenioHistoryCreationAttributes>
    implements ConvenioHistoryAttributes {
    public id!: number;
    public convenioId!: number;
    public updatedAt!: Date;
    public oldValues!: object;
    public newValues!: object;
}

ConvenioHistory.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        convenioId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: "Convenios",
                key: "id",
            },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
        },
        updatedAt: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        oldValues: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
        newValues: {
            type: DataTypes.JSONB,
            allowNull: false,
        },
    },
    {
        sequelize,
        tableName: "ConvenioHistory",
        timestamps: false
    }
);

export default ConvenioHistory;