import path from "path";
import dotenv from "dotenv";
dotenv.config({
    path: path.join(process.cwd(), '.env')
})


const config = {
    CONNECTION_STRING: process.env.CONNECTION_STRING,
    PORT: process.env.PORT,
    SALT_ROUNDS: process.env.SALT_ROUNDS,
    JWT_ACCESSTOKEN_SECRET: process.env.JWT_ACCESSTOKEN_SECRET,
    JWT_REFRESHTOKEN_SECRET: process.env.JWT_REFRESHTOKEN_SECRET
}

export default config;