import { Router } from "express";
import PortalAPIController from "../modules/client-api-portal/controller/PortalAPIController";

const router: Router = Router();


/**
 * @swagger
 * /portal-api/update:
 *   get:
 *     summary: Atualiza banco de dados com informações do Portal da Transparência
 *     tags: [Portal API]
 *     responses:
 *       200:
 *         description: Atualização concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Convenios e Convenentes Atualizados"
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/update", PortalAPIController.updateDB);

/**
 * @swagger
 * /portal-api/update/{convenioId}:
 *   patch:
 *     summary: Atualiza um convênio específico no banco de dados
 *     tags: [Portal API]
 *     parameters:
 *       - in: path
 *         name: convenioId
 *         required: true
 *         description: ID do convênio a ser atualizado
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Atualização concluída com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Convenio Atualizado"
 */
router.patch("/update/:convenioId", PortalAPIController.updateConvenio);

export default router;