import app from "./app"
import config from "./config"


const main =()=>{
  app.listen(config
    .PORT, () => {
  console.log(`Example app listening on port ${config.PORT}`)
})
}


main()