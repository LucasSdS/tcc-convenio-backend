import { Router } from "express";
import ConvenioController from "../modules/api/controller/ConvenioController";

const router: Router = Router();

/**
 * @swagger
 * /api/convenios:
 *   get:
 *     summary: Retorna todos os convênios
 *     tags: [Convenios]
 *     responses:
 *       200:
 *         description: Lista de todos os convênios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Convenio'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/convenios", ConvenioController.getAllConvenios);

/**
 * @swagger
 * /api/convenios/ranking:
 *   get:
 *     summary: Retorna ranking de convênios
 *     tags: [Convenios]
 *     parameters:
 *       - in: query
 *         name: startYear
 *         required: true
 *         schema:
 *           type: string
 *         description: Ano de início (formato dd/mm/yyyy)
 *       - in: query
 *         name: endYear
 *         required: true
 *         schema:
 *           type: string
 *         description: Ano fim (formato dd/mm/yyyy)
 *       - in: query
 *         name: limit
 *         required: true
 *         schema:
 *           type: integer
 *         description: Limite de resultados
 *     responses:
 *       200:
 *         description: Ranking de convênios
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ifesRankingDTO:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IfesRanking'
 *                 convenentesRankingDTO:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ConvenentesRanking'
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/convenios/ranking", ConvenioController.rankingConvenios);

export default router;