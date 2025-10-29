import { ProductStore } from '../../models/product';
import { UserStore } from '../../models/user';
import { OrderStore } from '../../models/order';
import pool from '../../database';

const products = new ProductStore();
const users = new UserStore();
const orders = new OrderStore();

async function resetDb() {
  await pool.query('BEGIN');
  await pool.query('TRUNCATE TABLE order_items RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE orders RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
  await pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  await pool.query('COMMIT');
}

describe('OrderStore Model', () => {
  let userId: number;
  let productId: number;
  let orderId: number;

  beforeAll(async () => {
    await resetDb();
    const u = await users.create({ first_name: 'Order', last_name: 'Owner', password: 'pw' });
    userId = u.id!;
    const p = await products.create({ name: 'Widget', price: 5 });
    productId = p.id!;
  });

  it('create() creates an order', async () => {
    const o = await orders.create({ user_id: userId, status: 'active' });
    expect(o).toBeDefined();
    orderId = o.id!;
    expect(o.status).toBe('active');
  });

  it('addItem() adds a product to the order', async () => {
    const item = await orders.addItem({ order_id: orderId, product_id: productId, quantity: 3 });
    expect(item.order_id).toBe(orderId);
    expect(item.product_id).toBe(productId);
    expect(item.quantity).toBe(3);
  });

  it('currentByUser() returns the active order with items', async () => {
    const cur = await orders.currentByUser(userId);
    expect(cur).toBeTruthy();
    expect(cur.user_id).toBe(userId);
    expect(Array.isArray(cur.items)).toBeTrue();
    expect(cur.items.length).toBe(1);
    expect(cur.items[0].quantity).toBe(3);
  });
});