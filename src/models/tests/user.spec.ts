import client from '../../database'
import { UserRepo } from '../user'

async function reset() {
  const c = await client.connect()
  try {
    await c.query('BEGIN')
    await c.query('TRUNCATE order_items, orders, products, users RESTART IDENTITY CASCADE')
    await c.query('COMMIT')
  } catch (e) { await c.query('ROLLBACK'); throw e } finally { c.release() }
}

describe('UserRepo', () => {
  const repo = new UserRepo()

  beforeAll(reset)
  afterEach(reset)

  it('create() hashes and returns public fields', async () => {
    const u = await repo.create({ first_name: 'Moe', last_name: 'Abubaker', password: 'secret' })
    expect(u.id).toBeDefined()
    // @ts-expect-error password not exposed
    expect(u.password).toBeUndefined()
  })

  it('all() returns array', async () => {
    await repo.create({ first_name: 'A', last_name: 'B', password: 'x' })
    const users = await repo.all()
    expect(users.length).toBe(1)
  })

  it('byId() gets one', async () => {
    const u = await repo.create({ first_name: 'X', last_name: 'Y', password: 'z' })
    const got = await repo.byId(u.id!)
    expect(got?.first_name).toBe('X')
  })
})