import express, { type Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pool } from './db';
import { AuthRouter } from './module/user/auth.route';
import { issuesRoute } from './module/issues/issues.route';
import globalErrorHandler from './middleware/globalErrorHandler';
const app:Application = express();


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({origin:"*"}))

app.get('/', (req: express.Request, res: express.Response) =>{
    res.status(200).json({message:"server is working fine"})
})


app.use('/api/auth', AuthRouter)

app.use('/api', issuesRoute)

// global error handler middleware 
app.use(globalErrorHandler)

export default app;