import client from '../database'
import bcrypt from 'bcrypt'

export type User = { id?: number; first_name: string; last_name: string; password?: string }

const pepper = process.env.PEPPER || ''
const rounds = parseInt(process.env.SALT_ROUNDS || '10', 10)

export class UserRepo {
  async all(): Promise<Omit<User, 'password'>[]> {
    const conn = await client.connect()
    try {
      const q = 'SELECT id, first_name, last_name FROM users ORDER BY id ASC'
      const { rows } = await conn.query(q)
      return rows
    } finally {
      conn.release()
    }
  }

  async byId(id: number): Promise<Omit<User, 'password'> | null> {
    const conn = await client.connect()
    try {
      const q = 'SELECT id, first_name, last_name FROM users WHERE id=$1'
      const { rows } = await conn.query(q, [id])
      return rows[0] ?? null
    } finally {
      conn.release()
    }
  }

  async create(u: User): Promise<Omit<User, 'password'>> {
    const conn = await client.connect()
    try {
      const hash = bcrypt.hashSync(String(u.password) + pepper, rounds)
      const q = `
        INSERT INTO users (first_name, last_name, password)
        VALUES ($1, $2, $3)
        RETURNING id, first_name, last_name`
      const { rows } = await conn.query(q, [u.first_name, u.last_name, hash])
      return rows[0]
    } finally {
      conn.release()
    }
  }
}