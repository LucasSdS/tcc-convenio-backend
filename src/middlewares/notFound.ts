import { Request, Response, NextFunction } from "express";
import ErrorDTO from "../../dto/Error";

/**
 * Middleware para lidar com rotas não encontradas (404)
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const path = req.originalUrl || req.url;
    const method = req.method;

    console.log(`[404] Rota não encontrada: ${method} ${path}`);

    const errorResponse = new ErrorDTO(
        404,
        "Rota não encontrada",
        `A rota ${method} ${path} não existe na API`
    );

    res.status(404).json(errorResponse);
};