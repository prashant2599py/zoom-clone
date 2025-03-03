import React, { useCallback, useEffect, useState } from 'react';
import { useSocket } from '../providers/Socket';
import { useNavigate } from 'react-router-dom';

export const HomePage = () => {

    const [email, setEmail] = useState('');
    const [room, setRoom] = useState('');

    const socket = useSocket();
    const navigate = useNavigate();

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        console.log(email, room);
        socket.emit('room:join', { email, room });
    },[email, room, socket])

    const handleJoinRoom = useCallback( (data) => {
        const { email, room } = data;
        console.log('user', email, 'joined room', room);
        navigate(`/room/${room}`);
    }, [navigate])

    useEffect( () => {
        socket.on('room:joined', handleJoinRoom)

        return () => {
            socket.off('room:joined', handleJoinRoom)
        }

    },[socket, handleJoinRoom])

    return (
        <div>
            <h1>Home Page</h1>
            <input type="text" placeholder='Enter email address' onChange={e => setEmail(e.target.value)} />
            <input type="text" placeholder='Enter room Id' onChange={e => setRoom(e.target.value)} />
            <button onClick={handleSubmit}>Enter Room</button>
        </div>
    )
}
export default HomePage;