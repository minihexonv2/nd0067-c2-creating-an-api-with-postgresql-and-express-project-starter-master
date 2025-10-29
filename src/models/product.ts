import pool from '../database';

export type Product = {
  id?: number;
  name: string;
  price: number;
};

export class ProductStore {
  async index(): Promise<Product[]> {
    const { rows } = await pool.query('SELECT id, name, price FROM products ORDER BY id');
    return rows.map(r => ({ ...r, price: Number(r.price) }));
  }

  async show(id: number): Promise<Product | null> {
    const { rows } = await pool.query('SELECT id, name, price FROM products WHERE id = $1', [id]);
    if (!rows[0]) return null;
    const r = rows[0];
    return { ...r, price: Number(r.price) };
  }

  async create(p: Product): Promise<Product> {
    const { rows } = await pool.query(
      'INSERT INTO products (name, price) VALUES ($1, $2) RETURNING id, name, price',
      [p.name, p.price]
    );
    const r = rows[0];
    return { ...r, price: Number(r.price) };
  }
}