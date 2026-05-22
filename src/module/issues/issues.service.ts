import type { TIssues } from "./issues.interface";
import { pool } from "../../db";

const createIssesToDB =async (data: TIssues) =>{

    const {id, title, description, type, status, reporter_id} = data;
      const result = await pool.query(`
        
        INSERT INTO issues (id,title, description, type, status, reporter_id) VALUES($1, $2, $3, $4, COALESCE($5,'open'),$6)
        RETURNING *
        
        `, [id, title, description, type, status, reporter_id]);


        
        return result.rows[0];
}

const getAllIssuesFromDB = async() =>{
    const result = await pool.query(`
        SELECT * FROM issues
        
        
        `)

       
    return result.rows;
}

export const IssuesService ={
    createIssesToDB,
    getAllIssuesFromDB
}