import { Router } from "express";
import IfesController from "../modules/api/controller/IfesController";

const router: Router = Router();

/**
 * @swagger
 * /api/ifes:
 *   get:
 *     summary: Retorna todas as Ifes
 *     tags: [Ifes]
 *     responses:
 *       200:
 *         description: Lista de todas as Ifes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 allIfes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ifes'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/ifes", IfesController.getAllIfes);

/**
 * @swagger
 * /api/ifes/{ifesCode}:
 *   get:
 *     summary: Retorna uma Ifes específica pelo código
 *     tags: [Ifes]
 *     parameters:
 *       - in: path
 *         name: ifesCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Código da Ifes
 *     responses:
 *       200:
 *         description: Detalhes da Ifes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ifes:
 *                   $ref: '#/components/schemas/Ifes'
 *       404:
 *         description: Ifes não encontrada
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
router.get("/ifes/:ifesCode", IfesController.getIfesByCode);

/**
 * @swagger
 * /api/ifes/compare/convenios:
 *   post:
 *     summary: Compara convênios entre universidades
 *     tags: [Ifes]
 *     parameters:
 *       - in: query
 *         name: dataInicio
 *         required: true
 *         schema:
 *           type: string
 *         description: Data de início (formato dd/mm/yyyy)
 *       - in: query
 *         name: dataFim
 *         required: true
 *         schema:
 *           type: string
 *         description: Data fim (formato dd/mm/yyyy)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ifesSelected
 *             properties:
 *               ifesSelected:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Lista de códigos de Ifes para comparação
 *     responses:
 *       200:
 *         description: Comparação de convênios entre universidades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 comparacaoIfesConveniosResponse:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/IfesComparadas'
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
router.post("/ifes/compare/convenios", IfesController.compareIfesConvenios);


export default router;