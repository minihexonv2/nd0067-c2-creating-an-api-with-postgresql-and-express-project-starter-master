import { Application, Request, Response } from 'express';
import { verifyAuthToken } from '../middleware/auth';
import { OrderStore } from '../models/order';

const store = new OrderStore();

export default function ordersRoutes(app: Application) {
  
  app.post('/orders', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const { user_id, status } = req.body ?? {};
      if (!user_id || !status) return res.status(400).json({ error: 'user_id and status are required' });

      const created = await store.create({ user_id: Number(user_id), status });
      res.status(201).json(created);
    } catch {
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  
  app.post('/orders/:id/products', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const order_id = Number(req.params.id);
      const { product_id, quantity } = req.body ?? {};
      if (Number.isNaN(order_id) || !product_id || !quantity) {
        return res.status(400).json({ error: 'order id param, product_id, quantity are required' });
      }
      const added = await store.addItem({ order_id, product_id: Number(product_id), quantity: Number(quantity) });
      res.status(201).json(added);
    } catch {
      res.status(500).json({ error: 'Failed to add item' });
    }
  });

  
  app.get('/users/:id/orders/current', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const userId = Number(req.params.id);
      if (Number.isNaN(userId)) return res.status(400).json({ error: 'Invalid user id' });
      const current = await store.currentByUser(userId);
      if (!current) return res.status(404).json({ error: 'No active order' });
      res.status(200).json(current);
    } catch {
      res.status(500).json({ error: 'Failed to fetch current order' });
    }
  });
}