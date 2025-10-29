import { Application, Request, Response } from 'express'
import { OrderRepo } from '../models/order'
import { authGuard } from '../middleware/auth'

const repo = new OrderRepo()

export default function ordersRoutes(app: Application) {
  app.get('/orders/current/:user_id', authGuard, currentForUser)
}

async function currentForUser(req: Request, res: Response) {
  const userId = Number(req.params.user_id)
  try {
    const rows = await repo.currentForUser(userId)
    if (!rows) return res.status(404).json({ error: 'No active order' })
    // flat rows array (id, status, user_id, product_id, quantity)
    res.json(rows)
  } catch {
    res.status(500).json({ error: 'Fetch failed' })
  }
}