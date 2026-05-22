import express, { type Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app:Application = express();


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({origin:"*"}))

app.get('/', (req: express.Request, res: express.Response) =>{
    res.status(200).json({message:"server is working fine"})
})
export default app;