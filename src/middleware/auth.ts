import type { NextFunction, Request, Response } from "express";
import {type TUserRole } from "../types";
import jwt,{type JwtPayload} from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";
const auth = (...roles:TUserRole[]) =>{
    return async( req:Request, res:Response, next:NextFunction)=>{
       

  try{

 const token = req.headers.authorization;

 if(!token){
    res.status(401).json({
        success:false,
        message:"Unauthorized access!"
    })
 }


 const decoded = jwt.verify(token as string, config.JWT_ACCESSTOKEN_SECRET as string) as JwtPayload
 
 const userData = await pool.query(`
    
    SELECT * FROM users WHERE email = $1
 `,[decoded?.email]);


 if(userData.rows.length === 0){
    return res.status(401).json({
        success:false,
        message:"Unauthorized access!"
    })
 }

 if(roles.length && !roles.includes(userData.rows[0].role)){
    return res.status(403).json({
        success:false,
        message:"Forbidden access!"
    })
 }
 
req.user = decoded;
next()

  } catch(error:any){
    next(error)
  }


}

}
export default auth;