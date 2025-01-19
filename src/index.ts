import express from "express";
import 'dotenv/config'
import PortalAPIRouter from "./routes/PortalAPIRouter";
import IfesRouter from "./routes/IfesRouter";
import sequelize from "../database/postgresqlConfig";
import { enableCors } from "./routes/middlewares/cors";
import ConvenioRouter from "./routes/ConvenioRouter";
import createAssociationsModels from "./models/associations";
import IfesController from "./modules/api/controller/IfesController";

let app = express();

// Propriedades Servidor
const PORT: number = parseInt(process.env.PORT || '3001');
const HOSTNAME: string = process.env.HOST || 'localhost';

// Configuração servidor
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(enableCors);

// Rotas:
app.use("/healthcheck", (req, res, next) => {
    res.send(200)
});
app.use("/portal-api", PortalAPIRouter);
app.use("/api", IfesRouter);
app.use("/api", ConvenioRouter);

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

        } catch (error) {
            console.error('Unable to connect to the database:', error);
        }
    }
});