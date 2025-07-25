import DashboardController from "../controllers/DashboardController";
import { Router } from "express";

const router: Router = Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Obter estatísticas gerais do dashboard
 *     description: Retorna um conjunto consolidado de estatísticas do sistema, incluindo totais de convênios, IFES, convenentes e informações sobre tipos de convenentes e data da última atualização.
 *     tags:
 *       - Dashboard
 *     responses:
 *       200:
 *         description: Estatísticas obtidas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/StatsDTO'
 *             example:
 *               data:
 *                 totalConvenios: 3628
 *                 totalIfes: 68
 *                 totalConveniosActives: 516
 *                 totalConvenentes: 186
 *                 convenentesTypes: ["administração pública estadual ou do distrito federal", "administração pública municipal", "agentes intermediários", "entidades empresariais privadas", "entidades sem fins lucrativos", "pessoa física"]
 *                 lastUpdatedDate: "2025-07-24"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               error: "Erro interno do servidor"
 *               message: "Erro ao buscar estatísticas do dashboard"
 *               timestamp: "2025-07-24T10:30:00.000Z"
 */
router.get("/stats", DashboardController.getDashboardStatus);

export default router;