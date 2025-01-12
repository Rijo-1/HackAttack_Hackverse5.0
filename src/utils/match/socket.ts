import { io, Socket } from 'socket.io-client';

export interface RoomUser {
  id: string;
  name: string;
}

export class MatchSocket {
  private socket: Socket;
  private handlers: Map<string, (data: any) => void>;

  constructor(url: string) {
    this.socket = io(url, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ['websocket']
    });

    this.handlers = new Map();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to trading server');
      this.notifyHandlers('connect', null);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from trading server');
      this.notifyHandlers('disconnect', null);
    });

    this.socket.on('roomUpdate', (data: { users: RoomUser[] }) => {
      console.log('Room update received:', data);
      this.notifyHandlers('roomUpdate', data);
    });

    this.socket.on('error', (error: { message: string }) => {
      console.error('Socket error:', error);
      this.notifyHandlers('error', error);
    });
  }

  private notifyHandlers(event: string, data: any) {
    const handler = this.handlers.get(event);
    if (handler) {
      handler(data);
    }
  }

  public connect() {
    this.socket.connect();
  }

  public disconnect() {
    this.socket.disconnect();
  }

  public joinRoom(roomId: string, userId: string, userName: string) {
    console.log('Joining room:', { roomId, userId, userName });
    this.socket.emit('joinRoom', { roomId, userId, userName });
  }

  public on(event: string, handler: (data: any) => void) {
    this.handlers.set(event, handler);
  }

  public off(event: string) {
    this.handlers.delete(event);
  }
}

export const createMatchSocket = (url: string) => new MatchSocket(url);