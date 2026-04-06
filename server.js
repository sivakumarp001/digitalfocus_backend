const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, true);
  },
  credentials: true
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
