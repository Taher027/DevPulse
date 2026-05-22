import { pool } from "../../db";
import { hashedPassword } from "../../utils/hashedPassword";
import type { TUser } from "./auth.interface";
import bcrypt from 'bcrypt'
import config from "../../config";
import {userToken} from "../../utils/userToken";

const createUser = async (payload: TUser)=>{
    const {id, name, email,password,role } = payload;
    const hashedPasswordValue = await hashedPassword(password);
    const result = await pool
    .query(`
        INSERT INTO users (id, name, email, password, role)
        VALUES ($1, $2, $3, $4 , COALESCE($5, 'contributor'))
        RETURNING *
        
        `,[id, name, email, hashedPasswordValue, role])

 delete result.rows[0].password;
 return result.rows[0];
    

} 

const userLogin = async( payload: {email:string, password:string}) =>{
    const {email, password} = payload;
     const userData = await pool.query(`
         SELECT * FROM users WHERE email = $1
        `,[email])

      if(userData.rows.length === 0) {
        throw new Error("Invalid User credentials")
      }
      //check password, 
      const verifyPassword = await bcrypt.compare(password, userData?.rows[0]?.password)
      if(!verifyPassword){
        throw new Error("Invalid User Credentials")
      }


      // generate accessToken,
      const userInfo = userData.rows[0] 
      const jwtPayload = {
        id: userInfo.id,
        email:userInfo.email,
        role:userInfo.role
      }

      const accessToken = userToken(jwtPayload, config.JWT_ACCESSTOKEN_SECRET as string, {expiresIn: "5h"});
      const refreshToken = userToken(jwtPayload, config.JWT_REFRESHTOKEN_SECRET as string, {expiresIn: "30d"});
      delete userData.rows[0].password;
      return {
        accessToken,
        refreshToken,
        user:userData.rows[0]
      }

       
}


export const authService = {
    createUser,
    userLogin
}