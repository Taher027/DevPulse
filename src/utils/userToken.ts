import jwt, { type JwtPayload } from 'jsonwebtoken'
export const userToken = (jwtPayload:JwtPayload, tokenSecret:string, options:Object) =>{
    const token = jwt.sign(jwtPayload, tokenSecret, options)
    return token;

}