import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from "path";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Portal Convênios API',
            version: '1.0.0',
            description: 'API para gerenciamento de convênios entre universidades federais',
            contact: {
                name: 'TCC Convênios',
            },
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server',
            },
        ]
    },
    apis: [path.resolve(__dirname, '../**/*.js')],
};

const specs = swaggerJsdoc(options);
export { specs, swaggerUi };