import config from "../config"
import {Pool} from "pg"

export  const pool = new Pool({
    connectionString: config.CONNECTION_STRING
})


const initDB = async ()=>{

    try {
        await pool.query(`
            
            CREATE TABLE IF NOT EXISTS users(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            email VARCHAR(100) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role VARCHAR(50) DEFAULT 'contributor',
            crated_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
            )
            
            
            
            `);
            console.log('database connected successfull')

    }
    catch (error){
        console.log('Error from database initialization:', error)
    }
    
}

export default initDB;