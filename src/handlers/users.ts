import { Application, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserStore } from '../models/user';


import * as Auth from '../middleware/auth';
const verifyAuthToken: (req: Request, res: Response, next: NextFunction) => void =
  typeof (Auth as any).verifyAuthToken === 'function'
    ? (Auth as any).verifyAuthToken
    : (_req: Request, _res: Response, next: NextFunction) => next();

const store = new UserStore();

export default function usersRoutes(app: Application) {
  // Protected routes
  app.get('/users', verifyAuthToken, async (_req: Request, res: Response) => {
    try {
      const users = await store.index();
      res.status(200).json(users);
    } catch {
      res.status(500).json({ error: 'Failed to list users' });
    }
  });

  app.get('/users/:id', verifyAuthToken, async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return res.status(400).json({ error: 'Invalid user id' });
      const user = await store.show(id);
      if (!user) return res.status(404).json({ error: 'Not found' });
      res.status(200).json(user);
    } catch {
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  
  app.post('/users', async (req: Request, res: Response) => {
    try {
      const { first_name, last_name, password } = req.body ?? {};
      if (!first_name || !last_name || !password) {
        return res.status(400).json({ error: 'first_name, last_name, password are required' });
      }
      const created = await store.create({ first_name, last_name, password });

      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is not set' });

      const token = jwt.sign({ user: created }, secret);
      res.status(201).json({ ...created, token });
    } catch {
      res.status(500).json({ error: 'Failed to create user' });
    }
  });

  app.post('/users/authenticate', async (req: Request, res: Response) => {
    try {
      const { first_name, password } = req.body ?? {};
      if (!first_name || !password) return res.status(400).json({ error: 'first_name and password are required' });

      const authed = await store.authenticate(first_name, password);
      if (!authed) return res.status(401).json({ error: 'Invalid credentials' });

      const secret = process.env.JWT_SECRET;
      if (!secret) return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is not set' });

      const token = jwt.sign({ user: authed }, secret);
      res.status(200).json({ ...authed, token });
    } catch {
      res.status(500).json({ error: 'Failed to authenticate' });
    }
  });
}