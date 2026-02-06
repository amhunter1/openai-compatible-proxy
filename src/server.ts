import express from 'express';
import { config } from './config';
import chatRoutes from './routes/chat';
import modelsRoutes from './routes/models';

const app = express();

app.use(express.json());

app.use('/', chatRoutes);
app.use('/', modelsRoutes);

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
