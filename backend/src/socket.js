import jwt from 'jsonwebtoken';
import { triggerSOSMatch } from './services/matchingService.js';
import Helper from './models/Helper.js';
import SOSRequest from './models/SOSRequest.js';
import mongoose from 'mongoose';

export const setupSocket = (io) => {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // { id, role }
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid Token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.user.id}, Role: ${socket.user.role})`);

    // On connection, mark user/helper online
    socket.join(socket.user.id.toString());
    
    if (socket.user.role === 'helper' || socket.user.role === 'admin') {
      await Helper.findOneAndUpdate(
        { userId: socket.user.id },
        { isOnline: true, lastSeen: Date.now() }
      );
    }

    // Helper updates their live location
    socket.on('helper:update_location', async (data) => {
      const { lng, lat } = data;
      await Helper.findOneAndUpdate(
        { userId: socket.user.id },
        { 
          currentLocation: { type: 'Point', coordinates: [lng, lat] },
          lastSeen: Date.now(),
          isOnline: true 
        }
      );
    });

    // Handle SOS Accept
    socket.on('sos:accept', async (data) => {
      const { sosId } = data;
      // Get the SOS request
      const sos = await SOSRequest.findById(sosId);
      
      if (!sos || sos.status !== 'active') {
        socket.emit('sos:error', { message: 'SOS request no longer active.' });
        return;
      }
      
      if (socket.user.role !== 'helper' && socket.user.role !== 'admin') {
        socket.emit('sos:error', { message: 'Unauthorized. Only helpers can accept SOS requests.' });
        return;
      }

      const helper = await Helper.findOne({ userId: socket.user.id });
      if (!helper) {
        socket.emit('sos:error', { message: 'Helper profile not found.' });
        return;
      }

      // Atomically update SOS if it's still active
      const updatedSos = await SOSRequest.findOneAndUpdate(
        { _id: sosId, status: 'active' },
        { 
          status: 'helper_assigned', 
          helperAssigned: helper._id,
        },
        { new: true }
      );

      if (updatedSos) {
        // I am the winner
        socket.join(sosId.toString()); // Join dedicated SOS room
        const userHelper = await mongoose.model('User').findById(helper.userId);
        const resolvedHelper = { 
          ...helper.toObject(), 
          name: userHelper.name, 
          phone: userHelper.phone, 
          gender: userHelper.gender 
        };
        io.to(updatedSos.userId.toString()).emit('sos:assigned', { sos: updatedSos, helper: resolvedHelper });
        socket.emit('sos:success', { message: 'SOS assigned to you.', sos: updatedSos });
        
        // Let the user know so they can join the room too
        const userSocketId = updatedSos.userId.toString();
        // The user should listen to 'sos:assigned' and then emit a 'join' to that room or just use the room implicitly
      } else {
        // Someone else got it before you
        socket.emit('sos:error', { message: 'Alert already accepted by another helper.' });
      }
    });
    
    // User joins SOS room explicitly after assignment to begin chat/tracking
    socket.on('sos:join_room', (data) => {
       const { sosId } = data;
       socket.join(sosId);
    });

    // Continuous user lat/lng updates broadcast to the SOS room (for the helper to see)
    socket.on('sos:update_location', (data) => {
      const { sosId, lng, lat } = data;
      io.to(sosId).emit('sos:location_update', { userId: socket.user.id, lng, lat });
    });

    // Chat between user/helper in room
    socket.on('chat:send', (data) => {
      const { sosId, message } = data;
      io.to(sosId).emit('chat:receive', { senderId: socket.user.id, message, timestamp: Date.now() });
    });

    socket.on('disconnect', async () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.user.role === 'helper' || socket.user.role === 'admin') {
        await Helper.findOneAndUpdate(
          { userId: socket.user.id },
          { isOnline: false, lastSeen: Date.now() }
        );
      }
    });
  });
};
