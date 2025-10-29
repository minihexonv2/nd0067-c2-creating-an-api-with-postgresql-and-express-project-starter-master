import client from '../../database'
import { OrderRepo } from '../order'
import { ProductRepo } from '../product'

async function reset() {
  const c = await client.connect()
  try {
    await c.query('BEGIN')
    await c.query('TRUNCATE order_items, orders, products, users RESTART IDENTITY CASCADE')
    await c.query('COMMIT')
  } catch (e) { await c.query('ROLLBACK'); throw e } finally { c.release() }
}

describe('OrderRepo', () => {
  const repo = new OrderRepo()
  const products = new ProductRepo()

  beforeAll(reset)
  afterEach(reset)

  it('currentForUser() returns null when no active order', async () => {
    expect(await repo.currentForUser(1)).toBeNull()
  })

  it('currentForUser() returns flat rows for active order', async () => {
    const c = await client.connect()
    try {
      const u = await c.query("INSERT INTO users (first_name,last_name,password) VALUES ('U','L','x') RETURNING id")
      const uid = u.rows[0].id as number
      const p1 = await products.create({ name: 'Toy', price: 6 })
      const o = await c.query("INSERT INTO orders (user_id, status) VALUES ($1,'active') RETURNING id", [uid])
      const oid = o.rows[0].id as number
      await c.query('INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1,$2,2)', [oid, p1.id])

      const rows = await repo.currentForUser(uid)
      expect(rows).not.toBeNull()
      expect(rows!.length).toBe(1)
      expect(rows![0]).toEqual(jasmine.objectContaining({ id: oid, user_id: uid }))
    } finally { c.release() }
  })
})