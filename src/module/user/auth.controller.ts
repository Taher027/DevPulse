import type { Request , Response} from "express"
import { authService } from "./auth.service"

const userSignup = async(req:Request, res:Response) =>{
    console.log('from auth controller', req.body)
    const result = await authService.createUser(req.body);
    console.log("result from auth.service:", result)
    res.status(201).json({
        status:"success",
        message:"user created successfully",
        data: result
    })

}
const userLogin = async(req:Request, res:Response) =>{
 try {
       const result = await authService.userLogin(req.body)
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