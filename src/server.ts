import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' })

import productsRoutes from './handlers/products'
import usersRoutes from './handlers/users'
import ordersRoutes from './handlers/orders'

const app = express()


const corsOptions: cors.CorsOptions = {
   origin: 'http://localhost:3000',
   optionsSuccessStatus: 200
}
app.use(cors(corsOptions))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

productsRoutes(app)
usersRoutes(app)
ordersRoutes(app)

const port = process.env.PORT || 3000
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Server listening on :${port}`))
}

export default app