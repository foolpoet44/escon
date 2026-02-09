'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import * as Y from 'yjs';

interface CollaborationUser {
  userId: string;
  userName: string;
  x: number;
  y: number;
  nodeId?: string;
  color: string;
}

interface UseCollaborationProps {
  roomId: string;
  userName: string;
  onUserJoin?: (user: CollaborationUser) => void;
  onUserLeave?: (userId: string) => void;
  onCursorUpdate?: (user: CollaborationUser) => void;
  onNodeSelection?: (data: {
    userId: string;
    userName: string;
    nodeId: string;
    selected: boolean;
  }) => void;
}

const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#FFA500', '#9B59B6', '#3498DB',
  '#E74C3C', '#2ECC71', '#F39C12', '#1ABC9C', '#34495E',
];

export function useCollaboration({
  roomId,
  userName,
  onUserJoin,
  onUserLeave,
  onCursorUpdate,
  onNodeSelection,
}: UseCollaborationProps) {
  const socketRef = useRef<Socket | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const [connected, setConnected] = useState(false);
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const socket = io({
      path: '/api/socketio',
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to collaboration server');
      setConnected(true);
      setError(null);
      socket.emit('join-room', roomId, userName);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from collaboration server');
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Connection error:', err);
      setError('Failed to connect to collaboration server');
      setConnected(false);
    });

    socket.on('user-joined', (data: { userId: string; userName: string }) => {
      const color = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
      const newUser: CollaborationUser = {
        userId: data.userId,
        userName: data.userName,
        x: 0,
        y: 0,
        color,
      };
      setUsers((prev) => [...prev, newUser]);
      onUserJoin?.(newUser);
    });

    socket.on('user-left', (data: { userId: string }) => {
      setUsers((prev) => prev.filter((u) => u.userId !== data.userId));
      onUserLeave?.(data.userId);
    });

    socket.on('room-users', (roomUsers: Array<{ socketId: string; userName: string }>) => {
      const mappedUsers = roomUsers.map((u, idx) => ({
        userId: u.socketId,
        userName: u.userName,
        x: 0,
        y: 0,
        color: USER_COLORS[idx % USER_COLORS.length],
      }));
      setUsers(mappedUsers);
    });

    socket.on('cursor-update', (data: CollaborationUser) => {
      setUsers((prev) => {
        const existing = prev.find((u) => u.userId === data.userId);
        if (existing) {
          return prev.map((u) =>
            u.userId === data.userId ? { ...u, x: data.x, y: data.y, nodeId: data.nodeId } : u
          );
        }
        return [...prev, { ...data, color: USER_COLORS[prev.length % USER_COLORS.length] }];
      });
      onCursorUpdate?.(data);
    });

    socket.on('node-selection', (data: {
      userId: string;
      userName: string;
      nodeId: string;
      selected: boolean;
    }) => {
      onNodeSelection?.(data);
    });

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    return () => {
      socket.disconnect();
      ydoc.destroy();
    };
  }, [roomId, userName]);

  const updateCursor = (x: number, y: number, nodeId?: string) => {
    socketRef.current?.emit('cursor-move', { roomId, x, y, nodeId });
  };

  const selectNode = (nodeId: string, selected: boolean) => {
    socketRef.current?.emit('node-select', { roomId, nodeId, selected });
  };

  const broadcastGraphUpdate = (update: Uint8Array) => {
    socketRef.current?.emit('graph-update', { roomId, update });
  };

  return {
    connected,
    users,
    error,
    updateCursor,
    selectNode,
    broadcastGraphUpdate,
    ydoc: ydocRef.current,
    socket: socketRef.current,
  };
}
