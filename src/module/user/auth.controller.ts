import type { Request , Response} from "express"
import { authService } from "./auth.service"

const userSignup = async(req:Request, res:Response) =>{
   
    try{
        const result = await authService.createUser(req.body);
    
    res.status(201).json({
        status:"success",
        message:"user created successfully",
        data: result
    })
    }catch(error:any){
             res.status(400).json({
                status: false,
                message: error.message,
                 error:error
             })
    }

}
const userLogin = async(req:Request, res:Response) =>{
    const {email, password} = req.body;
 try {
       const result = await authService.userLogin({email,password})
    const {accessToken, refreshToken, user} = result;

res.cookie("refreshToken",refreshToken, {
    httpOnly:true,
    secure:true,
    sameSite:"lax"
})

res.status(200).json({
    status: "success",
    message: "Login successful",
    data:{
        token:accessToken,
        user:user
    }
}) 
}catch(error:any){
    res.status(401).json({
        status: false,
        message: error.message,
        error:error
    })


 }



}





export const authController ={
    userSignup,
    userLogin
}