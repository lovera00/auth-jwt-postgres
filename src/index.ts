import express, { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import userRoutes from './routes/users.routes';

const app = express();
app.use(express.json());

app.use('/users', userRoutes);

app.use((err: ErrorRequestHandler, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(500).send('Something broke!');
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});


