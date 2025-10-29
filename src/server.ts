import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import registerRoutes from './handlers';

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());


registerRoutes(app);


app.get('/', (_req, res) => res.send('server is running'));

const port = Number(process.env.PORT || 3001);


if (process.env.ENV !== 'test') {
  app.listen(port, () => {
    
    console.log(`Server listening on :${port}`);
  });
}

export default app;