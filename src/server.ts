import app from "./app"
import config from "./config"
import initDB from "./db"


const main =()=>{

initDB()

  app.listen(config
    .PORT, () => {
  console.log(`Example app listening on port ${config.PORT}`)
})
}


main()