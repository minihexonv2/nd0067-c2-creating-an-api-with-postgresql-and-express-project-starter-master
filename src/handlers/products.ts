import { Application, Request, Response } from 'express';
import { ProductStore } from '../models/product';
import { verifyAuthToken } from '../middleware/auth';

const store = new ProductStore();

export default function productsRoutes(app: Application) {
  app.get('/products', async (_req: Request, res: Response) => {
    try {
      const products = await store.index();
      res.status(200).json(products);
    } catch {
      res.status(500).json({ error: 'Failed to list products' });
    }
  });

  app.get('/products/:id', async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid product id' });
      const product = await store.show(id);
      if (!product) return res.status(404).json({ error: 'Not found' });
      res.status(200).json(product);
    } catch {
      res.status(500).json({ error: 'Failed to get product' });
    }
  });

  app.post('/products', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const { name, price } = req.body ?? {};
      if (!name || price === undefined) return res.status(400).json({ error: 'name and price are required' });

      const numericPrice = Number(price);
      if (Number.isNaN(numericPrice)) return res.status(400).json({ error: 'price must be a number' });

      const created = await store.create({ name, price: numericPrice });
      res.status(201).json(created);
    } catch {
      res.status(500).json({ error: 'Failed to create product' });
    }
  });
}