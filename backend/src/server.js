import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import sosRoutes from './routes/sosRoutes.js';
import helperRoutes from './routes/helperRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import { setupSocket } from './socket.js';
 
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});

app.set('io', io); // Make 'io' accessible to controllers

app.use(cors());
app.use(helmet());
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/sos', sosRoutes);
app.use('/api/helpers', helperRoutes);
app.use('/api/admin', adminRoutes);

// Setup Socket logic
setupSocket(io);

// Basic Route
app.get('/', (req, res) => {
  res.json({ message: 'Prahari API server is running.' });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    // Start Server
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
