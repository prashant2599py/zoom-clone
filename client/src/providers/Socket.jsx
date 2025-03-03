import React, { useContext, useMemo } from "react";
import { io } from 'socket.io-client';

const SocketContext = React.createContext(null);

export const useSocket = () => {
    const socket = useContext(SocketContext);
    return socket;
}
export const SocketProvider  = (props) => {
    const socket = useMemo(() => io('http://localhost:8001'),[]);
    return (
        <SocketContext.Provider value={socket}>
            {props.children}
        </SocketContext.Provider>
    )
}