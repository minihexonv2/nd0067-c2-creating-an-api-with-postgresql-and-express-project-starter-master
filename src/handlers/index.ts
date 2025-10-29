import type { Application } from 'express';

import productsRoutes from './products';
import usersRoutes from './users';
import ordersRoutes from './orders';

export default function registerRoutes(app: Application) {
  productsRoutes(app);
  usersRoutes(app);
  ordersRoutes(app);
}