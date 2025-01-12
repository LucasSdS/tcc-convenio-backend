import Ifes from "../models/Ifes";
import IfesDTO from "../dto/Ifes";

export class IfesRepository {
    static async getAllIfes(): Promise<IfesDTO[]> {
        console.log(`Buscando todas as Ifes da tabela`);

        try {
            await Ifes.sync();
            const allIfesQuery = await Ifes.findAll();
            return allIfesQuery.map(({ dataValues }) => {
                return new IfesDTO(dataValues.code, dataValues.acronym, dataValues.name);
            });

        } catch (error: any) {
            console.log("Ocorreu um erro ao buscar todas Ifes");
            console.error(error.name, error.message);
            throw error;
        }
    }

    static async getIfesByCode(ifesCode: string): Promise<IfesDTO> {
        console.log(`Buscando Ifes com código: ${ifesCode}`);

        try {
            await Ifes.sync();
            let findIfesEntity = await Ifes.findOne({
                where: {
                    code: ifesCode
                }
            });

            if (!findIfesEntity) {
                throw new Error(`Ifes's code ${ifesCode} not found in database ERROR`);
            }

            const { code, acronym, name } = findIfesEntity.dataValues as { code: string, acronym: string, name: string };
            return new IfesDTO(code, acronym, name);

        } catch (error: any) {
            console.log(`Ocorreu um erro ao tentar buscar a Ifes ${ifesCode}`);
            console.error(error.name, error.message);
            throw error
        }

    }

    static async updateIfes(ifes: IfesDTO): Promise<void> {

        try {
            await Ifes.sync();
            let findIfes = await Ifes.findOne({
                where: {
                    acronym: ifes.acronym,
                    name: ifes.name
                }
            });

            if (findIfes) {
                findIfes.code = ifes.code;
                findIfes.save();
            } else {
                throw new Error(`Ifes ${ifes.name} not found in database ERROR`);
            }

        } catch (error: any) {
            console.log("Ocorreu um erro ao atualizar Ifes", ifes.name);
            console.error(error.name, error.message);
            throw error;
        }
    }

}