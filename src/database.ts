import dotenv from 'dotenv'
import { Pool } from 'pg'
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' })
export default new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
})