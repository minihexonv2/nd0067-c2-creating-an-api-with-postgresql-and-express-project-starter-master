import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function verifyAuthToken(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.headers.authorization || '';
    const [scheme, token] = auth.split(' ');

    if (scheme?.toLowerCase() !== 'bearer' || !token) {
      return res.status(401).json({ error: 'Authorization header must be Bearer <token>' });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      
      return res.status(500).json({ error: 'Server misconfiguration: JWT_SECRET is not set' });
    }

    jwt.verify(token, secret);
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}