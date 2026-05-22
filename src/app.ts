import express, { type Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pool } from './db';
const app:Application = express();


app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({origin:"*"}))

app.get('/', (req: express.Request, res: express.Response) =>{
    res.status(200).json({message:"server is working fine"})
})

app.post('/create-user', async(req: express.Request, res: express.Response) =>{
   const {id, name, email, password, role} = req.body ;
  
   const result = await  pool.query(`
    INSERT INTO users(id, name, email, password, role) VALUES($1, $2,$3,$4,$5)
    RETURNING *
    
    `, [id, name, email, password, role])

    res.status(201).json({
        message:"User created successfully",
        user: result.rows[0]
    })

})   // Handle user creation logic here
export default app;