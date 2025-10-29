import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload } from 'jsonwebtoken'

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload | string
}

export const authGuard = (req: Request, res: Response, next: NextFunction) => {
  const hdr = req.headers.authorization
  if (!hdr || !hdr.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Auth required' })
  }
  try {
    const token = hdr.slice(7)
    const payload = jwt.verify(token, process.env.TOKEN_SECRET as string)
    ;(req as AuthenticatedRequest).user = payload

    return next()
  } catch {
    return res.status(401).json({ error: 'Token invalid' })
  }
}