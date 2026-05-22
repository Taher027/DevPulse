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


            await pool.query(`
                CREATE TABLE IF NOT EXISTS issues(
                id SERIAL PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT NOT NULL  CHECK (char_length(description) >19 ),
                type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
                status VARCHAR(50)  DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
                reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()

            )`);



            console.log('database connected successfull')

    }
    catch (error){
        console.log('Error from database initialization:', error)
    }
    
}

export default initDB;