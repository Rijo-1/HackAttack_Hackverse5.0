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

app.use(cors());
app.use(express.json());

// Store active teams with their sockets
const teams = new Map();

// API endpoint to check if team exists
app.get('/api/teams/:teamCode', (req, res) => {
  const { teamCode } = req.params;
  const team = teams.get(teamCode);
  
  if (team) {
    res.json({
      exists: true,
      team: {
        code: team.code,
        name: team.name,
        members: Array.from(team.members.values()).map(member => ({
          email: member.email,
          name: member.email.split('@')[0],
          role: member.isCreator ? 'Team Leader' : 'Member',
          isCreator: member.isCreator
        }))
      }
    });
  } else {
    res.json({ exists: false });
  }
});

// API endpoint to create a new team
app.post('/api/teams', (req, res) => {
  const { teamCode, teamName, creatorEmail } = req.body;
  
  if (teams.has(teamCode)) {
    return res.status(400).json({ error: 'Team already exists' });
  }

  // Initialize creator with trading data
  const creator = {
    email: creatorEmail,
    joinedAt: new Date(),
    isCreator: true,
    balance: 1000, // Initial balance
    pnl: 0,
    positions: [],
    trades: []
  };

  const newTeam = {
    code: teamCode,
    name: teamName,
    members: new Map([[creatorEmail, creator]]),
    createdAt: new Date(),
    sockets: new Set(),
    gameState: {
      started: false,
      ended: false,
      timeLeft: 900
    }
  };

  teams.set(teamCode, newTeam);
  console.log(`Team created: ${teamCode} by ${creatorEmail}`);
  res.json({ 
    teamCode, 
    message: 'Team created successfully',
    team: {
      name: teamName,
      members: [{ 
        ...creator,
        name: creatorEmail.split('@')[0],
        role: 'Team Leader'
      }]
    }
  });
});

io.on('connection', (socket) => {
  let currentTeam = null;
  let currentEmail = null;

  socket.on('createTeam', ({ teamCode, email }) => {
    const team = teams.get(teamCode);
    if (!team) {
      socket.emit('error', { message: 'Team not found' });
      return;
    }

    currentTeam = team;
    currentEmail = email;
    team.sockets.add(socket);
    socket.join(teamCode);

    // Send initial team state
    io.to(teamCode).emit('teamUpdate', {
      members: Array.from(team.members.values()).map(member => ({
        email: member.email,
        name: member.email.split('@')[0],
        role: member.isCreator ? 'Team Leader' : 'Member',
        isCreator: member.isCreator,
        balance: member.balance,
        pnl: member.pnl,
        positions: member.positions,
        trades: member.trades
      }))
    });
  });

  socket.on('joinTeam', ({ teamCode, email }) => {
    const team = teams.get(teamCode);
    if (!team) {
      socket.emit('error', { message: 'Team not found' });
      return;
    }

    team.members.set(email, {
      email,
      joinedAt: new Date(),
      isCreator: false,
      balance: 1000,
      pnl: 0,
      positions: [],
      trades: []
    });

    currentTeam = team;
    currentEmail = email;
    team.sockets.add(socket);
    socket.join(teamCode);

    // Broadcast updated team state to all members
    io.to(teamCode).emit('teamUpdate', {
      members: Array.from(team.members.values()).map(member => ({
        email: member.email,
        name: member.email.split('@')[0],
        role: member.isCreator ? 'Team Leader' : 'Member',
        isCreator: member.isCreator,
        balance: member.balance,
        pnl: member.pnl,
        positions: member.positions,
        trades: member.trades
      }))
    });

    console.log(`User ${email} joined team ${teamCode}`);
  });

  // Add new events for trading actions
  socket.on('placeTrade', ({ teamCode, email, trade }) => {
    console.log('Placing trade:', { teamCode, email, trade });
    const team = teams.get(teamCode);
    if (team && team.members.has(email)) {
      try {
        const member = team.members.get(email);
        if (!member.positions) {
          member.positions = [];
        }
        if (!member.trades) {
          member.trades = [];
        }

        // Validate trade
        if (trade.margin > member.balance) {
          socket.emit('error', { message: 'Insufficient balance' });
          return;
        }

        // Add trade to positions
        member.positions.push({
          ...trade,
          timestamp: Date.now()
        });
        member.balance -= trade.margin;

        // Broadcast update
        io.to(teamCode).emit('tradeUpdate', {
          email,
          positions: member.positions,
          balance: member.balance,
          trade: trade
        });

        console.log(`Trade placed by ${email} in team ${teamCode}`);
      } catch (error) {
        console.error('Error placing trade:', error);
        socket.emit('error', { message: 'Failed to place trade' });
      }
    } else {
      console.log('Team or member not found:', { teamCode, email });
      socket.emit('error', { message: 'Team or member not found' });
    }
  });

  socket.on('closeTrade', ({ teamCode, email, tradeIndex, closePrice }) => {
    const team = teams.get(teamCode);
    if (team && team.members.has(email)) {
      const member = team.members.get(email);
      const position = member.positions[tradeIndex];
      
      if (position) {
        // Calculate PnL
        const pnl = calculatePnL(position, closePrice);
        member.pnl += pnl;
        member.balance += position.margin + pnl;
        member.positions.splice(tradeIndex, 1);
        member.trades.push({
          ...position,
          closePrice,
          pnl,
          closedAt: new Date()
        });

        // Broadcast position close update
        io.to(teamCode).emit('tradeClose', {
          email,
          positions: member.positions,
          trades: member.trades,
          balance: member.balance,
          pnl: member.pnl
        });
      }
    }
  });

  // Add game state synchronization
  socket.on('gameStateUpdate', ({ teamCode, gameState }) => {
    const team = teams.get(teamCode);
    if (team) {
      team.gameState = gameState;
      io.to(teamCode).emit('gameStateSync', { gameState });
    }
  });

  // Helper function to calculate PnL
  function calculatePnL(position, closePrice) {
    const priceDiff = position.type === 'long'
      ? closePrice - position.entryPrice
      : position.entryPrice - closePrice;
    
    return (priceDiff / position.entryPrice) * position.amount * position.leverage;
  }

  // Add new event for game state
  socket.on('enterGame', ({ teamCode }) => {
    console.log(`Team ${teamCode} entering game`);
    const team = teams.get(teamCode);
    if (team) {
      try {
        // Notify all team members about game state change
        io.to(teamCode).emit('gameStateUpdate', {
          inGame: true,
          timestamp: Date.now(),
          teamCode
        });
        console.log(`Game state update sent to team ${teamCode}`);
      } catch (error) {
        console.error('Error sending game state update:', error);
        socket.emit('error', { message: 'Failed to enter game' });
      }
    } else {
      console.log(`Team ${teamCode} not found`);
      socket.emit('error', { message: 'Team not found' });
    }
  });

  socket.on('exitGame', ({ teamCode }) => {
    console.log(`Team ${teamCode} exiting game`);
    const team = teams.get(teamCode);
    if (team) {
      try {
        io.to(teamCode).emit('gameStateUpdate', {
          inGame: false,
          timestamp: Date.now(),
          teamCode
        });
        console.log(`Game exit state sent to team ${teamCode}`);
      } catch (error) {
        console.error('Error sending game exit state:', error);
      }
    }
  });

  socket.on('disconnect', () => {
    if (currentTeam) {
      currentTeam.sockets.delete(socket);
      
      // Only remove member if they're not the creator
      const member = currentTeam.members.get(currentEmail);
      if (member && !member.isCreator) {
        currentTeam.members.delete(currentEmail);
      }

      io.to(currentTeam.code).emit('teamUpdate', {
        members: Array.from(currentTeam.members.values())
      });

      // Clean up empty teams (no sockets connected)
      if (currentTeam.sockets.size === 0) {
        teams.delete(currentTeam.code);
        console.log(`Team ${currentTeam.code} deleted - no users connected`);
      }
    }
  });
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 
