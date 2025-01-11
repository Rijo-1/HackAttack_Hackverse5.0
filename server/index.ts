import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { randomUUID } from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Enable CORS for health check endpoint
app.use(cors());

// Health check endpoint
app.get('/health', (_, res) => {
  res.status(200).send('OK');
});

interface User {
  id: string;
  name: string;
  roomId: string;
}

interface Room {
  id: string;
  users: User[];
  trades: Map<string, TradeOffer>;
}

interface TradeOffer {
  offerId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  items: any[];
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
}

const rooms = new Map<string, Room>();

io.on('connection', (socket) => {
  const user: User = {
    id: socket.handshake.auth.playerId,
    name: socket.handshake.auth.playerName,
    roomId: ''
  };

  console.log(`User connected: ${user.name} (${user.id})`);

  socket.on('joinTradeRoom', ({ roomId }) => {
    user.roomId = roomId;
    socket.join(roomId);

    // Create room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        users: [],
        trades: new Map()
      });
    }

    const room = rooms.get(roomId)!;
    room.users.push(user);

    // Notify room about new user
    io.to(roomId).emit('roomUsers', room.users);
    console.log(`${user.name} joined room ${roomId}`);
  });

  socket.on('sendTradeOffer', ({ toUserId, items }) => {
    const room = rooms.get(user.roomId);
    if (!room) return;

    const tradeOffer: TradeOffer = {
      offerId: randomUUID(),
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId,
      items,
      status: 'pending'
    };

    room.trades.set(tradeOffer.offerId, tradeOffer);
    io.to(user.roomId).emit('tradeOffer', tradeOffer);
    console.log(`Trade offer sent from ${user.name} to ${toUserId}`);
  });

  socket.on('respondToTrade', ({ offerId, accept }) => {
    const room = rooms.get(user.roomId);
    if (!room) return;

    const trade = room.trades.get(offerId);
    if (!trade || trade.toUserId !== user.id) return;

    trade.status = accept ? 'accepted' : 'rejected';
    
    io.to(user.roomId).emit('tradeUpdate', {
      offerId,
      status: trade.status,
      message: accept ? 'Trade accepted' : 'Trade rejected'
    });

    if (accept) {
      io.to(user.roomId).emit('tradeCompleted', {
        offerId,
        fromUser: trade.fromUserName,
        toUser: user.name,
        items: trade.items
      });
    }
  });

  socket.on('cancelTrade', ({ offerId }) => {
    const room = rooms.get(user.roomId);
    if (!room) return;

    const trade = room.trades.get(offerId);
    if (!trade || trade.fromUserId !== user.id) return;

    trade.status = 'cancelled';
    io.to(user.roomId).emit('tradeCancelled', offerId);
  });

  socket.on('disconnect', () => {
    const room = rooms.get(user.roomId);
    if (room) {
      room.users = room.users.filter(u => u.id !== user.id);
      io.to(user.roomId).emit('roomUsers', room.users);

      // Clean up empty rooms
      if (room.users.length === 0) {
        rooms.delete(user.roomId);
      }
    }
    console.log(`User disconnected: ${user.name} (${user.id})`);
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 