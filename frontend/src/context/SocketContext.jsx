import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../services/config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (token && user) {
      const newSocket = io(SOCKET_URL, {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    } else {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
    }
  }, [token, user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
