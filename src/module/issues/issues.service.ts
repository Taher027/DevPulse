import type { TIssues } from "./issues.interface";
import { pool } from "../../db";
import type { JwtPayload } from "jsonwebtoken";

const createIssesToDB =async (data: TIssues) =>{

    const {id, title, description, type, status, reporter_id} = data;
      const result = await pool.query(`
        
        INSERT INTO issues (id,title, description, type, status, reporter_id) VALUES($1, $2, $3, $4, COALESCE($5,'open'),$6)
        RETURNING *
        
        `, [id, title, description, type, status, reporter_id]);


        
        return result.rows[0];
}

const getAllIssuesFromDB = async(query: {
  sort?: string;
  type?: string;
  status?: string;
}) =>{

    const {sort, type, status} = query;
    let sql = `
        SELECT 
        issues.id,
        issues.title,
        issues.description,
        issues.type,
        issues.status,

        json_build_object(
        'id', users.id,
        'name', users.name,
        'role', users.role
        ) AS reporter,
         issues.created_at,
         issues.updated_at
        FROM issues
        JOIN users ON issues.reporter_id = users.id

        
        
        `;
        const conditions:string[] = [];
        const values:string[] = [];
        // check type filter 

        if(type){
            values.push(type);
            conditions.push(`issues.type = $${values.length}`)
        }
        // status filter check 
        if(status){
            values.push(status);
            conditions.push(`issues.status = $${values.length}`)
        }

        if(conditions.length > 0){
            sql += ` WHERE ` + conditions.join(" AND ")
        }

        // sorting 
        if(sort === 'oldest'){
            sql += ` ORDER BY issues.created_at ASC`
        }else{
            sql += ` ORDER BY issues.created_at DESC`
        }
        const result = await pool.query(sql, values)

       
    return result.rows;
}
const getSingleIssuesFromDB = async(id:string) =>{
    const result = await pool.query(`
        SELECT 
        issues.id,
        issues.title,
        issues.description,
        issues.type,
        issues.status,

        json_build_object(
         'id', users.id,
         'name', users.name,
         'role' , users.role
        
         ) AS reporter,
          
        issues.created_at,
        issues.updated_at



        FROM issues
        JOIN users ON issues.reporter_id = users.id
        WHERE issues.id = $1
        
        `,[id]);


        return result
}



const updateIssuesToDB = async(id:string, data:Partial<TIssues>,user:JwtPayload)=>{
    

    const {title, description, type, status, } = data;
    if(user.role !== 'maintainer' && user.role === 'contributor'){
        const existingIssue = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        
        `,[id]);

        const issues_reporter_id = existingIssue.rows[0]?.reporter_id;
        if(issues_reporter_id !== user.id){
            throw new Error("Unauthorized to update this issue")
        }
    }
     




    const result = await pool.query(`
            UPDATE issues
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                type = COALESCE($3, type),
                status = COALESCE($4, status)
            WHERE id = $5
            RETURNING *
        `, [title, description, type, status, id]);
        console.log('result from service: ', result.rows[0]); 


    return result.rows;
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