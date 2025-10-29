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

describe('Users Routes', () => {
  let token = '';
  let userId: number;

  beforeAll(async () => {
    await resetDb();
  });

  it('POST /users creates a user and returns a token', async () => {
    const res = await request.post('/users').send({
      first_name: 'Api',
      last_name: 'User',
      password: '123456'
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
    userId = res.body.id;
  });

  it('GET /users requires token and returns a list', async () => {
    const res = await request.get('/users').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTrue();
  });

  it('GET /users/:id requires token and returns one user', async () => {
    const res = await request.get(`/users/${userId}`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(userId);
    expect(res.body.first_name).toBe('Api');
  });

  it('POST /users/authenticate returns token on correct credentials', async () => {
    const res = await request.post('/users/authenticate').send({
      first_name: 'Api',
      password: '123456'
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});