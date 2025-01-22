import Ifes from "./Ifes";
import Convenio from "./Convenio";
import Convenente from "./Convenente";

export default function createAssociationsModels() {
    Ifes.hasMany(Convenio, {
        foreignKey: 'ifesCode',
        sourceKey: 'code',
        as: 'convenios'
    });

    Convenio.belongsTo(Ifes, {
        foreignKey: 'ifesCode',
        targetKey: 'code',
        as: 'ifes'
    });

    Convenio.belongsTo(Convenente, {
        foreignKey: 'convenenteId',
        targetKey: 'id',
        as: 'convenente'
    });

    Convenente.hasMany(Convenio, {
        foreignKey: 'convenenteId',
        as: 'convenios'
    });

    console.log("Associações criadas.");
}