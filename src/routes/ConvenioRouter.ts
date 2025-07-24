import { Router } from "express";
import ConvenioController from "../controllers/ConvenioController";

const router: Router = Router();

/**
 * @swagger
 * /api/convenios/ranking:
 *   get:
 *     summary: Retorna ranking de convênios por IFES e convenentes
 *     tags: [Convenios]
 *     parameters:
 *       - in: query
 *         name: startYear
 *         required: true
 *         schema:
 *           type: string
 *         description: Ano de início para o ranking (formato dd/mm/yyyy)
 *         example: "01/01/2023"
 *       - in: query
 *         name: endYear
 *         required: true
 *         schema:
 *           type: string
 *         description: Ano fim para o ranking (formato dd/mm/yyyy)
 *         example: "31/12/2023"
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Limite de resultados no ranking
 *         example: 10
 *     responses:
 *       200:
 *         description: Ranking de convênios gerado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ifesRankingDTO:
 *                   type: array
 *                   description: Ranking das IFES com maiores valores liberados
 *                   items:
 *                     $ref: '#/components/schemas/IfesRanking'
 *                 convenentesRankingDTO:
 *                   type: array
 *                   description: Ranking dos convenentes com maiores valores recebidos
 *                   items:
 *                     $ref: '#/components/schemas/ConvenentesRanking'
 *       400:
 *         description: Parâmetros inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/convenios/ranking", ConvenioController.rankingConvenios);

/**
 * @swagger
 * /api/convenios/{conveniosNumber}:
 *   get:
 *     summary: Retorna um convênio específico pelo número
 *     tags: [Convenios]
 *     parameters:
 *       - in: path
 *         name: conveniosNumber
 *         required: true
 *         schema:
 *           type: string
 *         description: Número único do convênio
 *         example: "123456789"
 *     responses:
 *       200:
 *         description: Convênio encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Convenio'
 *       404:
 *         description: Convênio não encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/convenios/:conveniosNumber", ConvenioController.getConvenioByNumber);

/**
 * @swagger
 * /api/convenios:
 *   get:
 *     summary: Lista todos os convênios com paginação, ordenação e filtros
 *     tags: [Convenios]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *           minimum: 1
 *         description: Número da página (padrão 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           minimum: 1
 *           maximum: 100
 *         description: Registros por página (padrão 10, máximo 100)
 *       - in: query
 *         name: all
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Se true, retorna todos os registros (para exportação CSV)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: lastReleaseDate
 *           enum: 
 *             - startEffectiveDate
 *             - endEffectiveDate
 *             - lastReleaseDate
 *             - totalValueReleased
 *             - valueLastRelease
 *             - totalValue
 *             - createdAt
 *         description: Campo para ordenação
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           default: DESC
 *           enum: [ASC, DESC]
 *         description: Ordem da classificação
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filtro por descrição (busca com LIKE)
 *       - in: query
 *         name: origin
 *         schema:
 *           type: string
 *         description: Filtro por origem (busca com LIKE)
 *       - in: query
 *         name: startEffectiveDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtro por data de início da vigência
 *       - in: query
 *         name: endEffectiveDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtro por data de fim da vigência
 *       - in: query
 *         name: lastReleaseDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filtro por data da última liberação
 *       - in: query
 *         name: totalValueReleased
 *         schema:
 *           type: number
 *         description: Filtro por valor total liberado
 *       - in: query
 *         name: valueLastRelease
 *         schema:
 *           type: number
 *         description: Filtro por valor da última liberação
 *       - in: query
 *         name: totalValue
 *         schema:
 *           type: number
 *         description: Filtro por valor total do convênio
 *       - in: query
 *         name: ifesAcronym
 *         schema:
 *           type: string
 *         description: Filtro por sigla da universidade
 *       - in: query
 *         name: convenenteType
 *         schema:
 *           type: string
 *         description: Filtro por tipo do convenente
 *     responses:
 *       200:
 *         description: Lista de convênios com metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   description: Lista de convênios
 *                   items:
 *                     type: object
 *                     properties:
 *                       detailUrl:
 *                         type: string
 *                         description: URL com detalhes do convênio
 *                       description:
 *                         type: string
 *                         description: Descrição do convênio
 *                       origin:
 *                         type: string
 *                         description: Origem do convênio
 *                       totalValueReleased:
 *                         type: number
 *                         description: Valor total liberado
 *                       totalValue:
 *                         type: number
 *                         description: Valor total do convênio
 *                       valueLastRelease:
 *                         type: number
 *                         description: Valor da última liberação
 *                       startEffectiveDate:
 *                         type: string
 *                         format: date
 *                         description: Data de início da vigência
 *                       endEffectiveDate:
 *                         type: string
 *                         format: date
 *                         description: Data do fim da vigência
 *                       destination:
 *                         type: string
 *                         description: Nome do convenente
 *                       destinationType:
 *                         type: string
 *                         description: Tipo do convenente
 *                       destinationDetailUrl:
 *                         type: string
 *                         description: URL com detalhes do convenente
 *                       acronym:
 *                         type: string
 *                         description: Sigla da universidade
 *                 metadata:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                       description: Total de registros
 *                     limit:
 *                       type: integer
 *                       description: Limite por página
 *                     currentPage:
 *                       type: integer
 *                       description: Página atual
 *                     totalPages:
 *                       type: integer
 *                       description: Total de páginas
 *                     sortBy:
 *                       type: string
 *                       description: Campo de ordenação
 *                     sortOrder:
 *                       type: string
 *                       description: Ordem de classificação
 *       400:
 *         description: Parâmetros inválidos
 *       404:
 *         description: Nenhum convênio encontrado
 *       500:
 *         description: Erro interno do servidor
 */
router.get("/convenios", ConvenioController.getAllConvenios);

export default router;