import ConvenioDTO from "../dto/Convenio";
import Convenio from "../models/Convenio";

export class ConveniosRepository {
    static async createConvenio(convenio: ConvenioDTO): Promise<void> {
        console.log(`Criando convenio: ${convenio.number}`);
        try {
            await Convenio.sync();
            await Convenio.create(convenio);
        } catch (error: any) {
            console.log(`Ocorreu um erro ao tentar salvar o convenio ${convenio.number}`);
            console.error(error.name, error.message);
        }
    }

    static async bulkCreateConvenio(convenios: ConvenioDTO[]): Promise<void> {
        console.log(`Criando ${convenios.length} convenios`);
        try {
            await Convenio.sync();
            await Convenio.bulkCreate(convenios);
        } catch (error: any) {
            console.log(`Ocorreu um erro ao tentar salvar os convenios`);
            console.error(error.name, error.message);
        }
    }


    static async updateConvenio(convenioUpdated: ConvenioDTO): Promise<void> {
        console.log("updateConvenio: ", convenioUpdated.number);

        try {
            await Convenio.sync();
            let findConvenio = await Convenio.findOne({
                where: {
                    number: convenioUpdated.number
                }
            });

            if (findConvenio) {
                await findConvenio.update(convenioUpdated);

            } else {
                throw new Error(`Convenio's numero ${convenioUpdated.number} not found in database ERROR`);
            }
        } catch (error: any) {
            console.log(`Ocorreu um erro ao tentar atualizar o convenio ${convenioUpdated.number}`);
            console.error(error.name, error.message);
        }
    }

    static async getConvenioByNumber(conveniosNumber: string): Promise<any> {
        console.log(`Buscando convenio do numero ${conveniosNumber}`);

        try {
            await Convenio.sync();
            let findConvenioEntity = await Convenio.findOne({
                where: {
                    number: conveniosNumber
                }
            });

            if (!findConvenioEntity) {
                throw new Error(`Convenio's number ${conveniosNumber} not found in database ERROR`);
            }

            const { detailUrl, ifesCode, number, description, origin, destination, totalValueReleased, destinationType, destinationDetailUrl, startEffectiveDate, endEffectiveDate, lastReleaseDate, valueLastRelease, totalValue } = findConvenioEntity.dataValues as { detailUrl: string, ifesCode: string, number: string, description: string, origin: string, destination: string, totalValueReleased: number, destinationType: string, destinationDetailUrl: string, startEffectiveDate: Date, endEffectiveDate: Date, lastReleaseDate: Date, valueLastRelease: number, totalValue: number };

            const convenio = new ConvenioDTO(
                detailUrl,
                ifesCode,
                number,
                description,
                origin,
                destination,
                totalValueReleased,
                destinationType,
                destinationDetailUrl,
                startEffectiveDate,
                endEffectiveDate,
                lastReleaseDate,
                valueLastRelease,
                totalValue
            );

            return convenio;
        } catch (error: any) {
            console.log(`Ocorreu um erro ao tentar buscar o convenio ${conveniosNumber}`);
            console.error(error.name, error.message);
        }
    }

    static async getAll() {
        console.log("Buscando todos os convenios");
        try {
            return Convenio.findAll();
        } catch (error: any) {
            console.log("Ocorreu um erro ao buscar todos os convenios");
            console.error(error.name, error.message);
        }
    }
}