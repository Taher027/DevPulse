import path from "path";
import dotenv from "dotenv";
dotenv.config({
    path: path.join(process.cwd(), '.env')
})


const config = {
    CONNECTION_STRING: process.env.CONNECTION_STRING,
    PORT: process.env.PORT
}

export default config;