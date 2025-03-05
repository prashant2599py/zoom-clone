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

    const sendStreams = useCallback(() => {
        for(const track of myStream.getTracks()){
            peer.peer.addTrack(track, myStream);
        }
    },[myStream])

    const handleCallAccepted = useCallback(( { from, ans }) => {
        peer.setLocalDescription(ans);
        console.log(`call accepted`, from, ans); 
        sendStreams();      
    }, [sendStreams])

   

    const handleNegotiationNeeded = useCallback( async() => {
        const offer = await peer.getOffer();
        socket.emit('peer:nego:needed', { offer, to: remoteSocketId})
    }, [remoteSocketId, socket])

    const handleNegotiaitionIncoming = useCallback( async({ from, offer}) => {
        const ans = await peer.getAnswer(offer);
        socket.emit('peer:nego:done', { to: from, ans });
    }, [socket])

    const handleNegotiaitionFinal = useCallback( async({ ans}) => {
        await peer.setLocalDescription(ans);
    },[])
    
    useEffect(() => {
        peer.peer.addEventListener('track', async (ev) => {
            const remoteStream = ev.streams;
            setRemoteStream(remoteStream[0]);
        })
    },[])

    useEffect( () => {
        peer.peer.addEventListener('negotiation:needed', handleNegotiationNeeded)
        return () => {
            peer.peer.removeEventListener('negotiation:needed', handleNegotiationNeeded)
        }
    })

    useEffect( () => {
        socket.on('user:joined', handleUserJoined)
        socket.on('incomming:call', handleIncommingCall)  // incomming call handled here for acceptance
        socket.on('call:accepted', handleCallAccepted)
        socket.on('peer:nego:needed', handleNegotiaitionIncoming);
        socket.on('peer:nego:final', handleNegotiaitionFinal);

        return () => {
            socket.off('user:joined', handleUserJoined)
            socket.off('incomming:call', handleIncommingCall)
            socket.off('call:accepted', handleCallAccepted)
            socket.off('peer:nego:needed', handleNegotiaitionIncoming);
            socket.off('peer:nego:final', handleNegotiaitionFinal);
        }

    },[socket, handleUserJoined, handleIncommingCall, handleCallAccepted, handleNegotiaitionIncoming, handleNegotiaitionFinal])

    return (
        <div>
      <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStreams}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleCallUser}>CALL</button>}
      {myStream && (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={myStream}
          />
        </>
      )}
      {remoteStream && (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            playing
            muted
            height="100px"
            width="200px"
            url={remoteStream}
          />
        </>
      )}
    </div>
    )
}
export default RoomPage;