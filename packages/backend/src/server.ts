import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'API Server is running' });
});

// Import routes
import anthropicRouter from './routes/anthropic';
// import verifyRouter from './routes/verify';

// Register routes
app.use('/api/v1/anthropic', anthropicRouter);
// app.use('/api/v1/verify', verifyRouter);

// Start the server
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`CORS configured for origin: ${CORS_ORIGIN}`);
});

