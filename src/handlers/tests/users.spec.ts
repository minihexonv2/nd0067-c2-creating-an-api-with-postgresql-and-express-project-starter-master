import request from 'supertest'
import app from '../../server'
import client from '../../database'
import jwt from 'jsonwebtoken'

async function reset() {
  const c = await client.connect()
  try {
    await c.query('BEGIN')
    await c.query('TRUNCATE order_items, orders, products, users RESTART IDENTITY CASCADE')
    await c.query('COMMIT')
  } catch (e) { await c.query('ROLLBACK'); throw e } finally { c.release() }
}

describe('Users routes', () => {
  beforeAll(reset)
  afterEach(reset)

  it('POST /users creates a user and returns JWT', async () => {
    const res = await request(app)
      .post('/users')
      .send({ first_name: 'Moe', last_name: 'Abubaker', password: 'secret' })
      .expect(201)

    expect(res.body.user.first_name).toBe('Moe')
    expect(typeof res.body.token).toBe('string')
    const decoded = jwt.verify(res.body.token, process.env.TOKEN_SECRET || 'dev')
    expect(decoded).toBeTruthy()
  })

  it('GET /users requires auth', async () => {
    await request(app).get('/users').expect(401)
  })

  it('GET /users/:id returns user when authed', async () => {
    const created = await request(app)
      .post('/users')
      .send({ first_name: 'A', last_name: 'B', password: 'x' })
    const token = created.body.token as string
    const id = created.body.user.id as number

    const res = await request(app)
      .get(`/users/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)

    expect(res.body).toEqual(jasmine.objectContaining({ id, first_name: 'A', last_name: 'B' }))
  })
})