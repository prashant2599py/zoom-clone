import React, {useEffect, useState} from "react";
import { useNavigate } from "react-router-dom";
import { useSocket } from "../providers/Socket";
const Homepage = () => {
    const { socket } = useSocket();
    // socket.emit('join-room', { roomId: '123', emailId: 'abc@example.com' });

    const [email, setEmail] = useState();
    const [roomId, setRoomId] = useState();
    const navigate = useNavigate();

    const handleJoinRoom = () => {
        socket.emit('join-room', { emailId : email, roomId })    
    }

    function handleRoomJoined({ roomId }){
        // console.log('Room Joined ', roomId)
        navigate(`/room/${roomId}`)
    }
    useEffect( () => {
        socket.on('joined-room', handleRoomJoined);
        
        return () => {
            socket.off('joined-room', handleRoomJoined)
        }
        
    },[socket])

    return (
        <div>
            <input value={email} onChange={e => setEmail(e.target.value)} type="text" placeholder="enter email" />
            <input value={roomId} onChange={e => setRoomId(e.target.value)} type="text" placeholder="enter room id" />
            <button onClick={handleJoinRoom}>Enter room</button>
        </div>
    )
}

export default Homepage;