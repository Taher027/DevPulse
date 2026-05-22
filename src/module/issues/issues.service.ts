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
const getSingleIssuesFromDB = async(id:string) =>{
    const result = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        
        `,[id]);


        return result
}



const updateIssuesToDB = async(id:string, data:Partial<TIssues>)=>{

    const {title, description, type, status, } = data;
    const result = await pool.query(`
            UPDATE issues
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                type = COALESCE($3, type),
                status = COALESCE($4, status)
            WHERE id = $5
            RETURNING *
        `, [title, description, type, status, id]);

    return result.rows[0];
}

const deleteIssuesFromDB = async(id:string) =>{
    const result = await pool.query(`
        DELETE FROM issues WHERE id = $1
        
        `,[id]);

        return result;
}

export const IssuesService ={
    createIssesToDB,
    getAllIssuesFromDB,
    getSingleIssuesFromDB,
    updateIssuesToDB,
    deleteIssuesFromDB
}