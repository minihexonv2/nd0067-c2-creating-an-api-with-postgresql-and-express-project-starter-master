import { Application, Request, Response } from 'express'
import { ProductRepo } from '../models/product'
import { authGuard } from '../middleware/auth'

const repo = new ProductRepo()

export default function productsRoutes(app: Application) {
  app.get('/products', list)
  app.get('/products/:id', getOne)
  app.post('/products', authGuard, create)
}

async function list(_req: Request, res: Response) {
  try {
    res.json(await repo.all())
  } catch (e) {
    res.status(500).json({ error: 'Could not list products' })
  }
}

async function getOne(req: Request, res: Response) {
  const id = Number(req.params.id)
  try {
    const row = await repo.byId(id)
    if (!row) return res.status(404).json({ error: 'Not found' })
    res.json(row)
  } catch {
    res.status(500).json({ error: 'Fetch failed' })
  }
}

async function create(req: Request, res: Response) {
  try {
    const body = { name: req.body.name, price: Number(req.body.price) }
    const created = await repo.create(body)
    res.status(201).json(created)
  } catch {
    res.status(400).json({ error: 'Create failed' })
  }
}