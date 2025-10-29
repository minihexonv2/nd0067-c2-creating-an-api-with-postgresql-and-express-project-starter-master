import client from '../../database'
import { ProductRepo } from '../product'

async function reset() {
  const c = await client.connect()
  try {
    await c.query('BEGIN')
    await c.query('TRUNCATE order_items, orders, products, users RESTART IDENTITY CASCADE')
    await c.query('COMMIT')
  } catch (e) { await c.query('ROLLBACK'); throw e } finally { c.release() }
}

describe('ProductRepo', () => {
  const repo = new ProductRepo()

  beforeAll(reset)
  afterEach(reset)

  it('create() inserts and returns product', async () => {
    const p = await repo.create({ name: 'Scratcher', price: 18 })
    expect(p.id).toBeDefined()
    expect(p.name).toBe('Scratcher')
  })

  it('all() returns list', async () => {
    await repo.create({ name: 'Ball', price: 2 })
    const list = await repo.all()
    expect(list.length).toBe(1)
  })

  it('byId() returns one or null', async () => {
    const created = await repo.create({ name: 'Tunnel', price: 25 })
    expect((await repo.byId(created.id!))?.name).toBe('Tunnel')
    expect(await repo.byId(99999)).toBeNull()
  })
})