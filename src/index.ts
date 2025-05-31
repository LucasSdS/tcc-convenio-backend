import express from "express";
import * as dotenv from "dotenv";
import PortalAPIRouter from "./routes/PortalAPIRouter";
import IfesRouter from "./routes/IfesRouter";
import sequelize from "../database/postgresqlConfig";
import { enableCors } from "./routes/middlewares/cors";
import ConvenioRouter from "./routes/ConvenioRouter";
import createAssociationsModels from "./models/Associations";
import IfesController from "./modules/api/controller/IfesController";
import CronService from "./services/CronService";
import { specs, swaggerUi } from "./config/SwaggerConfig";
import { notFoundHandler } from "./routes/middlewares/notFound";

dotenv.config();
let app = express();

// Propriedades Servidor
const PORT: number = parseInt(process.env.PORT || '3001');
const HOSTNAME: string = process.env.HOST || '0.0.0.0';

// Configuração servidor
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(enableCors);

// Configuração Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

// Rotas:
app.use("/healthcheck", (req, res, next) => {
    res.send(200)
});
app.use("/portal-api", PortalAPIRouter);
app.use("/api", IfesRouter);
app.use("/api", ConvenioRouter);

app.use(notFoundHandler);

// Executando Servidor
app.listen(PORT, HOSTNAME, async (error?: Error) => {
    if (!error) {
        try {
            await sequelize.authenticate();
            createAssociationsModels();
            await sequelize.sync({ alter: true });
            await IfesController.createIfesByIfesJsonList();
            console.log('Conexão com banco de dados realizada com sucesso.');
            console.log(`Servidor online no endereço: http://${HOSTNAME}:${PORT}`);
            CronService.schedule();

        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
});