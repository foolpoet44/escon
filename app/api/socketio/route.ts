import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: any & {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function SocketHandler(
  req: NextApiRequest,
  res: NextApiResponseWithSocket
) {
  if (res.socket.server.io) {
    res.status(200).json({ success: true, message: 'Socket already running' });
    return;
  }

  const io = new SocketIOServer(res.socket.server, {
    path: '/api/socketio',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-room', (roomId: string, userName: string) => {
      socket.join(roomId);
      socket.to(roomId).emit('user-joined', {
        userId: socket.id,
        userName,
        timestamp: new Date().toISOString(),
      });
      
      const roomUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
        .map(socketId => ({
          socketId,
          userName: io.sockets.sockets.get(socketId)?.data?.userName || 'Anonymous',
        }));
      
      socket.emit('room-users', roomUsers);
      socket.data.userName = userName;
    });

    socket.on('cursor-move', (data: {
      roomId: string;
      x: number;
      y: number;
      nodeId?: string;
    }) => {
      socket.to(data.roomId).emit('cursor-update', {
        userId: socket.id,
        userName: socket.data?.userName || 'Anonymous',
        x: data.x,
        y: data.y,
        nodeId: data.nodeId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('node-select', (data: {
      roomId: string;
      nodeId: string;
      selected: boolean;
    }) => {
      socket.to(data.roomId).emit('node-selection', {
        userId: socket.id,
        userName: socket.data?.userName || 'Anonymous',
        nodeId: data.nodeId,
        selected: data.selected,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on('graph-update', (data: {
      roomId: string;
      update: Uint8Array;
    }) => {
      socket.to(data.roomId).emit('yjs-update', data.update);
    });

    socket.on('disconnecting', () => {
      const rooms = Array.from(socket.rooms).filter(room => room !== socket.id);
      rooms.forEach(roomId => {
        socket.to(roomId).emit('user-left', {
          userId: socket.id,
          userName: socket.data?.userName || 'Anonymous',
          timestamp: new Date().toISOString(),
        });
      });
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  res.socket.server.io = io;
  res.status(200).json({ success: true, message: 'Socket initialized' });
}
