import { Sequelize } from "sequelize";
import * as env from "dotenv";

// Inicializando env
env.config();
const DATABASE: string = process.env.POSTGRES_DATABASE || '';
const USER: string = process.env.POSTGRES_USER || '';
const PASSWORD: string = process.env.POSTGRES_PASSWORD || '';
const HOST: string = process.env.POSTGRES_HOST || '';

const sequelize = new Sequelize(
    DATABASE,
    USER,
    PASSWORD, {
    host: HOST,
    dialect: 'postgres',
    logging: false,
    define: {
        charset: 'utf-8',
        collate: 'utf8_general_ci'
    },
    timezone: "-03:00",
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    dialectOptions: {
        connectTimeout: 60000,
    }
});

export default sequelize;