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
async function makeToken() {
  const r = await request(app).post('/users').send({ first_name: 'U', last_name: 'L', password: 'p' })
  return r.body.token as string
}

describe('Products routes', () => {
  beforeAll(reset)
  afterEach(reset)

  it('GET /products starts empty', async () => {
    const res = await request(app).get('/products').expect(200)
    expect(res.body).toEqual([])
  })

  it('POST /products requires token', async () => {
    await request(app).post('/products').send({ name: 'Toy', price: 5 }).expect(401)
  })

  it('POST /products creates with token', async () => {
    const token = await makeToken()
    const res = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Feeder', price: 12.5 })
      .expect(201)
    expect(res.body).toEqual(jasmine.objectContaining({ name: 'Feeder', price: 12.5 }))
  })

  it('GET /products/:id returns item', async () => {
    const token = await makeToken()
    const created = await request(app)
      .post('/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bed', price: 40 })
    const id = created.body.id
    const res = await request(app).get(`/products/${id}`).expect(200)
    expect(res.body.name).toBe('Bed')
  })
})