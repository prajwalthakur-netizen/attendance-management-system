const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authRoutes = require('./routes/auth.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const overtimeRoutes = require('./routes/overtime.routes');
const userRoutes = require('./routes/user.routes');
const reportRoutes = require('./routes/report.routes');

const { notFound, errorHandler } = require('./middlewares/errorHandler.middleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/overtime', overtimeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;