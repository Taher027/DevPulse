import type { Request , Response} from "express"
import { authService } from "./auth.service"
import sendResponse from "../../utils/sendResponse";

const userSignup = async(req:Request, res:Response) =>{
   
    try{
        const result = await authService.createUser(req.body);
    

        sendResponse(res, {
            statusCode: 201,
            success: true,
            message:"user created successfully",
            data: result
            }
         )
    
    }catch(error:any){
             sendResponse(res, {
            statusCode: 400,
            success: false,
            message: error.message,
            error:error
            }
         )
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

 sendResponse(res, {
            statusCode: 200,
            success: true,
            message: "Login successful",
            data:{
                 token:accessToken,
                 user:user
                }
            } )


}catch(error:any){

        sendResponse(res, {
            statusCode: 401,
            success: false,
            message: error.message,
            error:error
            }
         )

}}

export const authController ={
    userSignup,
    userLogin
}