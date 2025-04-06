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

export default router;