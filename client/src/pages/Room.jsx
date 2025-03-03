import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from 'react-player';
import { useSocket } from "../providers/Socket";
import peer from "../services/peer";

export const RoomPage = () => {
    
    const socket = useSocket();
    const [remoteSocketId, setRemoteSocketId] = useState();
    const [myStream, setMyStream] = useState();
    const [remoteStream, setRemoteStream] = useState();


    const handleUserJoined = useCallback( ({ email, id }) => {
        console.log(`new user ${email} joined`);
        setRemoteSocketId(id);
    },[])

    const handleCallUser = useCallback( async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        
        // creation of offer from user 1 , sends it to user 2
        const offer = await peer.getOffer();
        socket.emit('user:call', { to: remoteSocketId, offer })

        setMyStream(stream);

    },[remoteSocketId, socket])

    const handleIncommingCall = useCallback(async ({ from, offer } ) => {
        console.log(`incomming call `, from , offer);
        
        setRemoteSocketId(from);
        
        const stream = await navigator.mediaDevices.getUserMedia({video : true, audio: true});
        setMyStream(stream);
        
        // Creation of answer by user 2 and sends it to user 1 for connection building 
        const ans = await peer.getAnswer(offer);
        socket.emit('call:accepted', { to: from, ans}) // emits the call:accepted event to user 1(from where call came) with answer

    },[socket])

    const handleCallAccepted = useCallback(( { from, ans }) => {
        peer.setLocalDescription(ans);
        console.log(`call accepted`, from, ans);
        
        for( const track of myStream.getTracks()){
            peer.peer.addTrack(track, myStream);
        }
    }, [myStream])

    useEffect(() => {
        peer.peer.addEventListener('track', async ev => {
            const stream = ev.streams;
            setRemoteStream(stream[0]);
        })
    })

    useEffect( () => {
        socket.on('user:joined', handleUserJoined)
        socket.on('incomming:call', handleIncommingCall)  // incomming call handled here for acceptance
        socket.on('call:accepted', handleCallAccepted)

        return () => {
            socket.off('user:joined', handleUserJoined)
            socket.off('incomming:call', handleIncommingCall)
            socket.off('call:accepted', handleCallAccepted)
        }

    },[socket, handleUserJoined, handleIncommingCall, handleCallAccepted])

    return (
        <div>
            <h1>Room Page</h1>
            { remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
            { myStream &&
            <>
            <h2>MY STREAM</h2>
                <ReactPlayer 
                    playing 
                    muted   
                    url={myStream}
                />
            </> 
            }
            { remoteStream && 
                <>
                    <h2>Remote Stream</h2>
                    <ReactPlayer playing muted   url={remoteStream}/>
                </>     
            }
        </div>
    )
}
export default RoomPage;