import client from '../database'

export type OrderRow = {
  id: number
  status: string
  user_id: number
  product_id: number | null
  quantity: number | null
}

export class OrderRepo {
  // returns flat rows for the active order; no JSON aggregate
  async currentForUser(userId: number): Promise<OrderRow[] | null> {
    const conn = await client.connect()
    try {
      const findOrder = `
        SELECT id, status, user_id
        FROM orders
        WHERE user_id = $1 AND status = 'active'
        ORDER BY id DESC
        LIMIT 1`
      const order = await conn.query(findOrder, [userId])
      if (order.rows.length === 0) return null

      const orderId = order.rows[0].id as number
      const itemsQ = `
        SELECT o.id, o.status, o.user_id, oi.product_id, oi.quantity
        FROM orders o
        LEFT JOIN order_items oi ON oi.order_id = o.id
        WHERE o.id = $1
        ORDER BY oi.product_id NULLS LAST`
      const { rows } = await conn.query(itemsQ, [orderId])
      return rows as OrderRow[]
    } finally {
      conn.release()
    }
  }
}