import pool from '../database';

export type Order = {
  id?: number;
  user_id: number;
  status: 'active' | 'complete' | string;
};

export type OrderItem = {
  order_id: number;
  product_id: number;
  quantity: number;
};

export class OrderStore {
  async create(o: Order): Promise<Order> {
    const { rows } = await pool.query(
      'INSERT INTO orders (user_id, status) VALUES ($1, $2) RETURNING id, user_id, status',
      [o.user_id, o.status]
    );
    return rows[0];
  }

  async addItem(item: OrderItem) {
    const { rows } = await pool.query(
      `INSERT INTO order_items (order_id, product_id, quantity)
       VALUES ($1, $2, $3)
       RETURNING order_id, product_id, quantity`,
      [item.order_id, item.product_id, item.quantity]
    );
    return rows[0];
  }

  async currentByUser(userId: number) {
    const { rows } = await pool.query(
      `SELECT o.id, o.user_id, o.status,
              json_agg(json_build_object('product_id', oi.product_id, 'quantity', oi.quantity)) AS items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1 AND o.status = 'active'
       GROUP BY o.id
       ORDER BY o.id DESC
       LIMIT 1`,
      [userId]
    );
    return rows[0] || null;
  }
}