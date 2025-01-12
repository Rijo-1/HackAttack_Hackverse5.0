import { z } from 'zod';

export const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  roomId: z.string().optional(),
  isReady: z.boolean().default(false),
  isConnected: z.boolean().default(true),
  lastActive: z.number().default(() => Date.now())
});

export const GameStateSchema = z.object({
  id: z.string(),
  status: z.enum(['waiting', 'playing', 'finished']),
  players: z.array(PlayerSchema),
  currentTurn: z.string().optional(),
  startedAt: z.number().optional(),
  lastUpdate: z.number().default(() => Date.now()),
  moves: z.array(z.any()).default([])
});

export type Player = z.infer<typeof PlayerSchema>;
export type GameState = z.infer<typeof GameStateSchema>;

export interface MatchEvent {
  type: 'join' | 'leave' | 'move' | 'ready' | 'disconnect' | 'reconnect';
  playerId: string;
  data?: any;
  timestamp: number;
}