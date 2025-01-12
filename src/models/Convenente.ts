import { DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../../database/postgresqlConfig";
import Convenio from "./Convenio";

class Convenente extends Model<InferAttributes<Convenente>, InferCreationAttributes<Convenio>> {
    id?: number;
    cpfFormatado: string;
    cnpjFormatado: string;
    numeroInscricaoSocial: string;
    nome: string;
    razaoSocialReceita: string;
    nomeFantasiaReceita: string;
    tipo: string;
};

Convenente.init(
    {
        id: {
            type: DataTypes.SMALLINT,
            primaryKey: true,
            field: 'id',
            allowNull: false
        },
        cpfFormatado: {
            type: DataTypes.STRING,
            field: 'cpfFormatado'
        }, 
        cnpjFormatado: {
            type: DataTypes.STRING,
            field: 'cnpjFormatado'
        }, 
        numeroInscricaoSocial: {
            type: DataTypes.STRING,
            field: 'numeroInscricaoSocial'
        }, 
        nome: {
            type: DataTypes.STRING,
            field: 'nome'
        }, 
        razaoSocialReceita: {
            type: DataTypes.STRING,
            field: 'razaoSocialReceita'
        }, 
        nomeFantasiaReceita: {
            type: DataTypes.STRING,
            field: 'nomeFantasiaReceita'
        }, 
        tipo: {
            type: DataTypes.STRING,
            field: 'tipo'
        }
    },
    {
        sequelize,
        modelName: 'Convenente',
        tableName: 'convenente',
        timestamps: false
    }
);

export default Convenente;
