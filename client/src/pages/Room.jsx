import React, { useCallback, useEffect } from "react";
import { useSocket } from "../providers/Socket";
import { usePeer } from "../providers/Peer";

const RoomPage = () => {
    const { socket }  = useSocket();
    const { peer, createOffer, setRemoteAnswer } = usePeer();

    const handleNewUserJoinedRoom = useCallback(async (data) => {
        const { emailId } = data;
        console.log('New user joined room ', emailId)
        const offer = await createOffer();
        socket.emit('call-user', { emailId, offer })
    },[createOffer, socket])

    const handleIncommingCall = useCallback( async (data) => {
        const {from, offer } = data;
        console.log('Incomming call from ', from, offer)
        const ans = await createAnswer(offer);
        socket.emit('call-accepted', { emailId: from, ans})
    },[socket])

    const handleCallAccepted = useCallback(async (data) => {
        console.log('Call accepted', ans)
        const { ans } = data;
        await setRemoteAnswer(ans);
       
    })
    useEffect( () => {
        socket.on('user-joined', handleNewUserJoinedRoom)
        socket.on('incomming-call', handleIncommingCall);
        socket.on('call-accepted', handleCallAccepted);

        return () => {
            socket.off('user-joined', handleNewUserJoinedRoom)
            socket.off('incomming-call', handleIncommingCall)
        }
    },[socket,handleNewUserJoinedRoom, handleIncommingCall,handleCallAccepted])
    return (
        <div>
            Room Page
        </div>
    )
}

export default RoomPage;