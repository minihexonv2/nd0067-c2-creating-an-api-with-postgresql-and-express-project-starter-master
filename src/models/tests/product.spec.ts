import { ProductStore } from '../../models/product';
import pool from '../../database';

const store = new ProductStore();

async function resetDb() {
  await pool.query('BEGIN');
  await pool.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  await pool.query('COMMIT');
}

describe('ProductStore Model', () => {
  beforeAll(async () => {
    await resetDb();
  });

  it('create() inserts and returns a product', async () => {
    const p = await store.create({ name: 'Book', price: 10.5 });
    expect(p).toBeDefined();
    expect(p.id).toBeDefined();
    expect(p.name).toBe('Book');
    expect(typeof p.price).toBe('number');
  });

  it('index() returns a list with at least 1 product', async () => {
    const list = await store.index();
    expect(Array.isArray(list)).toBeTrue();
    expect(list.length).toBeGreaterThan(0);
  });

  it('show() returns the product by id', async () => {
    const created = await store.create({ name: 'Pen', price: 2 });
    const found = await store.show(created.id!);
    expect(found).toBeTruthy();
    expect(found?.name).toBe('Pen');
    expect(found?.price).toBe(2);
  });
});