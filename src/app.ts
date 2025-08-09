import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app: Application = express();

// parsers
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  }),
);

// home route
app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to our Test School Server !');
});

export default app;
