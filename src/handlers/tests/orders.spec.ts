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

async function bootstrapUserProduct() {
  const u = await request.post('/users').send({
    first_name: 'OrderApi',
    last_name: 'User',
    password: 'pw'
  });
  const token = u.body.token as string;
  const productRes = await request
    .post('/products')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Chair', price: 40 });

  return { token, userId: u.body.id as number, productId: productRes.body.id as number };
}

describe('Orders Routes', () => {
  let token = '';
  let userId = 0;
  let productId = 0;
  let orderId = 0;

  beforeAll(async () => {
    await resetDb();
    const boot = await bootstrapUserProduct();
    token = boot.token;
    userId = boot.userId;
    productId = boot.productId;
  });

  it('POST /orders creates an order', async () => {
    const res = await request
      .post('/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({ user_id: userId, status: 'active' });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.status).toBe('active');
    orderId = res.body.id;
  });

  it('POST /orders/:id/products adds an item', async () => {
    const res = await request
      .post(`/orders/${orderId}/products`)
      .set('Authorization', `Bearer ${token}`)
      .send({ product_id: productId, quantity: 2 });

    expect(res.status).toBe(201);
    expect(res.body.order_id).toBe(orderId);
    expect(res.body.product_id).toBe(productId);
    expect(res.body.quantity).toBe(2);
  });

  it('GET /users/:id/orders/current returns the current order', async () => {
    const res = await request.get(`/users/${userId}/orders/current`).set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.user_id).toBe(userId);
    expect(Array.isArray(res.body.items)).toBeTrue();
    expect(res.body.items.length).toBe(1);
  });
});