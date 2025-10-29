import supertest from 'supertest';
import app from '../../server';
import pool from '../../database';

const request = supertest(app);

async function resetDb() {
  await pool.query('BEGIN');
  await pool.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  await pool.query('COMMIT');
}

async function createUserAndGetToken() {
  const res = await request.post('/users').send({
    first_name: 'Prod',
    last_name: 'Maker',
    password: 'pw'
  });
  return res.body.token as string;
}

describe('Products Routes', () => {
  let token = '';

  beforeAll(async () => {
    await resetDb();
    token = await createUserAndGetToken();
  });

  it('POST /products creates with token', async () => {
    const res = await request
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Laptop', price: 999.99 });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.name).toBe('Laptop');
  });

  it('GET /products/:id returns item', async () => {
    const created = await request
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mouse', price: 25 });
    const id = created.body.id;

    const res = await request.get(`/products/${id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Mouse');
  });

  it('GET /products returns a list', async () => {
    const res = await request.get('/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTrue();
    expect(res.body.length).toBeGreaterThan(0);
  });
});