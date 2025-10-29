import { Application, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { UserRepo } from '../models/user'
import { authGuard } from '../middleware/auth'

const repo = new UserRepo()

export default function usersRoutes(app: Application) {
  app.get('/users', authGuard, list)
  app.get('/users/:id', authGuard, getOne)
  app.post('/users', create) // returns token
}

async function list(_req: Request, res: Response) {
  try {
    res.json(await repo.all())
  } catch {
    res.status(500).json({ error: 'Could not list users' })
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
    const user = await repo.create({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      password: req.body.password,
    })
    const token = jwt.sign({ uid: user.id }, process.env.TOKEN_SECRET as string)
    res.status(201).json({ user, token })
  } catch {
    res.status(400).json({ error: 'Create failed' })
  }
}