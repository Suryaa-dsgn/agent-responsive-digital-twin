import * as express from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import verifyRouter from './routes/verify';
import healthRouter from './routes/health';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(requestLogger);

// Routes
app.use('/api/v1/verify', verifyRouter);
app.use('/health', healthRouter);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start the server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    console.log(`CORS configured for origin: ${CORS_ORIGIN}`);
  });
}

export default app;