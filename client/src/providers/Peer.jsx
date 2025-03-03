import React, { useCallback, useEffect, useMemo } from 'react';


const PeerContext = React.createContext(null);

export const usePeer = () => React.useContext(PeerContext);

export const PeerProvider = (props) => {
    const peer = useMemo( () => new RTCPeerConnection(), [])

    const createOffer = async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        return offer;
    }

    const createAnswer = async (offer) => {
        await peer.setRemoteDescription(offer);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        return answer;
    }

    const setRemoteAnswer = async (ans) => {
        await peer.setRemoteDescription(ans);
    }

    const sendStream = async (stream) => {
        const tracks = stream.getTracks();
        for(const track of tracks){
            peer.addTrack(track, stream);
        }
    }
    const handleTrackEvent = useCallback(async (ev) => {
        const streams = ev.streams;
        setRemoteStream(streams); 
    })

    useEffect( () => {
        peer.addEventListener('track', handleTrackEvent);

        return () => {
            peer.removeEventListener('track', handleTrackEvent);
        }
    }, [handleTrackEvent])

    return (
        <PeerContext.Provider value={{ peer, createOffer, createAnswer, setRemoteAnswer, sendStream }}>
            {props.children}
        </PeerContext.Provider>
    )
}