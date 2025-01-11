import { io } from 'socket.io-client';
import type { TeamSocket } from '../../types/socket';

export const createTeamSocket = (url: string): TeamSocket => {
  const socket = io(url, {
    transports: ['websocket'],
    autoConnect: false,
  }) as TeamSocket;

  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
}; 