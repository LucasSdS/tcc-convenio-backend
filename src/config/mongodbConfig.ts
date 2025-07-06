import mongoose from 'mongoose';
import * as env from "dotenv";

env.config();
mongoose.connect(process.env.MONGO_CONN || '').then(() => {
    console.log('Conectado ao MongoDB');
}).catch((err) => {
    console.log(err);
});

export default mongoose;