import client from '../database'

export type Product = { id?: number; name: string; price: number }

export class ProductRepo {
  async all(): Promise<Product[]> {
    const conn = await client.connect()
    try {
      const q = 'SELECT id, name, price FROM products ORDER BY id ASC'
      const { rows } = await conn.query(q)
      return rows
    } finally {
      conn.release()
    }
  }

  async byId(id: number): Promise<Product | null> {
    const conn = await client.connect()
    try {
      const q = 'SELECT id, name, price FROM products WHERE id = $1'
      const { rows } = await conn.query(q, [id])
      return rows[0] ?? null
    } finally {
      conn.release()
    }
  }

  async create(p: Product): Promise<Product> {
    const conn = await client.connect()
    try {
      const q = `
        INSERT INTO products (name, price)
        VALUES ($1, $2)
        RETURNING id, name, price`
      const { rows } = await conn.query(q, [p.name, p.price])
      return rows[0]
    } finally {
      conn.release()
    }
  }
}