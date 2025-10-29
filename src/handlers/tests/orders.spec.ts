import request from 'supertest'
import app from '../../server'
import client from '../../database'

async function reset() {
  const c = await client.connect()
  try {
    await c.query('BEGIN')
    await c.query('TRUNCATE order_items, orders, products, users RESTART IDENTITY CASCADE')
    await c.query('COMMIT')
  } catch (e) { await c.query('ROLLBACK'); throw e } finally { c.release() }
}
async function createUserAndToken() {
  const r = await request(app).post('/users').send({ first_name: 'X', last_name: 'Y', password: 'z' })
  return { token: r.body.token as string, userId: r.body.user.id as number }
}

describe('Orders routes', () => {
  beforeAll(reset)
  afterEach(reset)

  it('GET /orders/current/:user_id requires auth', async () => {
    await request(app).get('/orders/current/1').expect(401)
  })

  it('GET /orders/current/:user_id returns rows for active order', async () => {
    const { token, userId } = await createUserAndToken()

    // seed active order & items
    const c = await client.connect()
    const o = await c.query("INSERT INTO orders (user_id, status) VALUES ($1,'active') RETURNING id", [userId])
    const oid = o.rows[0].id as number
    const p = await c.query("INSERT INTO products (name, price) VALUES ('Toy', 5) RETURNING id")
    await c.query('INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1,$2,3)', [oid, p.rows[0].id])
    c.release()

    const res = await request(app)
      .get(`/orders/current/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(Array.isArray(res.body)).toBeTrue()
    expect(res.body[0]).toEqual(jasmine.objectContaining({ id: oid, user_id: userId }))
  })
})