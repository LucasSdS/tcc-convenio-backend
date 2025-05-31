import ConvenenteRepository from "../../../repositories/ConvenenteRepository";
import ConvenentesRankingDTO from "../dtos/ConvenentesRanking";

export default class ConvenentesService {

    static async getConvenentesRanking(convenentesRankingPartial: ConvenentesRankingDTO[], startYear: Date, endYear: Date) {
        const convenentesRankingId = convenentesRankingPartial.map(convenente => convenente.convenenteId);
        const convenentesIfesCode = [...new Set(convenentesRankingPartial.map(convenente => convenente.ifes))];

        const convenentesWithConveniosAndIfes = await ConvenenteRepository.getAllConvenentesWithTotalValueReleasedsConvenios(convenentesRankingId, convenentesIfesCode, startYear, endYear);

        const convenentesRankingDTOs = convenentesRankingPartial.map(convenentePartial => {
            const convenenteEncontrado = convenentesWithConveniosAndIfes.find(c => c.id === convenentePartial.convenenteId);

            if (convenenteEncontrado && convenenteEncontrado.convenios) {
                const ifesCodes = new Set(convenenteEncontrado.convenios.map(c => c.ifesCode));

                if (convenenteEncontrado.convenios.length > 0) {
                    const convenio = convenenteEncontrado.convenios[0];
                    return {
                        convenenteId: convenentePartial.convenenteId,
                        name: convenenteEncontrado.name,
                        totalValueReleased: Number(convenentePartial.totalValueReleased),
                        detailUrl: convenenteEncontrado.detailUrl,
                        ifes: {
                            code: convenio.ifesCode,
                            name: convenio.ifes!.name
                        }
                    };
                }
            }

        });

        return ConvenentesRankingDTO.fromPartialConvenentesRankingEntities(convenentesRankingDTOs);
    }

}