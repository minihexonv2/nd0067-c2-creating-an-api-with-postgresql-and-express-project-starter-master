import pool from '../database';
import bcrypt from 'bcrypt';

export type User = {
  id?: number;
  first_name: string;
  last_name: string;
  password: string; 
};

const pepper = process.env.BCRYPT_PASSWORD || '';
const saltRounds = parseInt(process.env.SALT_ROUNDS || '10', 10);

export class UserStore {
  async index() {
    const { rows } = await pool.query('SELECT id, first_name, last_name FROM users ORDER BY id');
    return rows;
  }

  async show(id: number) {
    const { rows } = await pool.query('SELECT id, first_name, last_name FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  }

  async create(u: User) {
    const hash = bcrypt.hashSync(u.password + pepper, saltRounds);
    const { rows } = await pool.query(
      'INSERT INTO users (first_name, last_name, password) VALUES ($1, $2, $3) RETURNING id, first_name, last_name',
      [u.first_name, u.last_name, hash]
    );
    return rows[0];
  }

  async authenticate(first_name: string, password: string) {
    const { rows } = await pool.query(
      'SELECT id, first_name, last_name, password FROM users WHERE first_name = $1',
      [first_name]
    );
    const user = rows[0];
    if (!user) return null;

    const ok = bcrypt.compareSync(password + pepper, user.password);
    if (!ok) return null;

    return { id: user.id, first_name: user.first_name, last_name: user.last_name };
  }
}