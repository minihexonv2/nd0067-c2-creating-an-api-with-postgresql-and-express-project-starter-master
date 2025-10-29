import { UserStore } from '../../models/user';
import pool from '../../database';

const store = new UserStore();

async function resetDb() {
  await pool.query('BEGIN');
  await pool.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  await pool.query('COMMIT');
}

describe('UserStore Model', () => {
  beforeAll(async () => {
    await resetDb();
  });

  it('create() stores a user and returns public fields', async () => {
    const u = await store.create({ first_name: 'Mo', last_name: 'Tester', password: 'pass123' });
    expect(u).toBeDefined();
    expect(u.id).toBeDefined();
    expect(u.first_name).toBe('Mo');
    expect((u as any).password).toBeUndefined();
  });

  it('index() lists users', async () => {
    const list = await store.index();
    expect(list.length).toBeGreaterThan(0);
    expect((list[0] as any).password).toBeUndefined();
  });

  it('show() returns a single user without password', async () => {
    const created = await store.create({ first_name: 'A', last_name: 'B', password: 'x' });
    const found = await store.show(created.id!);
    expect(found).toBeTruthy();
    expect(found?.first_name).toBe('A');
    expect((found as any).password).toBeUndefined();
  });

  it('authenticate() returns user on correct credentials', async () => {
    await store.create({ first_name: 'Auth', last_name: 'Ok', password: 'secret' });
    const auth = await store.authenticate('Auth', 'secret');
    expect(auth).toBeTruthy();
    expect(auth?.first_name).toBe('Auth');
  });

  it('authenticate() returns null on wrong password', async () => {
    const bad = await store.authenticate('Auth', 'wrong');
    expect(bad).toBeNull();
  });
});