const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  'https://digi-focus.vercel.app',
  'https://digital-focus-frontend.vercel.app', // in case of different name
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/focus', require('./routes/focusRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/quiz', require('./routes/quizRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/levels', require('./routes/levelRoutes'));
app.use('/api/leaderboard', require('./routes/leaderboardRoutes'));
app.use('/api/daily-tasks', require('./routes/dailyTaskRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', time: new Date() }));
app.get('/api', (req, res) => res.send('API is running...'));
app.get('/', (req, res) => res.send('API is running...'));

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`));
}

module.exports = app;
