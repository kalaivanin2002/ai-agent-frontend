'use client'

import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  VoiceAssistantControlBar,
  useRoomContext,
} from '@livekit/components-react';
import "@livekit/components-styles";
import { useState, useEffect, useCallback } from "react";
import { RoomEvent, Participant, Room, ConnectionState } from 'livekit-client';

const RoomComponent = () => {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const handleDisconnect = useCallback(() => {
    setToken(null);
    setUrl(null);
    localStorage.removeItem('identity');
  }, []);

  return (
    <main data-lk-theme="default">
      {token === null ? (
        <div className="lk-focus-layout">
          <button className="lk-button" onClick={async () => {
            const userId = localStorage.getItem('identity')
            const {accessToken, url, identity} = userId ? 
              await fetch('/api/token?identity=' + userId).then(res => res.json()) : 
              await fetch('/api/token').then(res => res.json())
            setToken(accessToken);
            setUrl(url);
            localStorage.setItem('identity', identity);
          }}>Connect</button>
        </div>
      ) : ( 
        <LiveKitRoom
          token={token}
          serverUrl={url ?? undefined}
          connectOptions={{autoSubscribe: true}}
          data-lk-theme="default"
          style={{ height: '100dvh' }}
          onDisconnected={handleDisconnect}
        >   
          <RoomEventLogger onDisconnect={handleDisconnect} />
          <SimpleVoiceAssistant />
          <VoiceAssistantControlBar />
          <RoomAudioRenderer />
        </LiveKitRoom>
      )}  
    </main>
  );  
};

const RoomEventLogger = ({ onDisconnect }: { onDisconnect: () => void }) => {
  const room = useRoomContext();

  useEffect(() => {
    const handleParticipantConnected = (participant: Participant) => {
      console.log('Agent connected:', participant.identity);
    };

    const handleParticipantDisconnected = (participant: Participant) => {
      console.log('Agent disconnected:', participant.identity);
      if (participant !== room.localParticipant) {
        console.log('Remote participant disconnected. Checking if room is empty...');
        if (room.remoteParticipants.size === 0) {
          console.log('Room is empty. Triggering disconnect.');
          onDisconnect();
        } else {
          console.log('Room still has participants. Not disconnecting.');
        }
      }
    };

    const handleRoomDisconnected = () => {
      onDisconnect();
    };

    const handleConnectionStateChange = (state: ConnectionState) => {
      if (state === ConnectionState.Disconnected) {
        onDisconnect();
      }
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    room.on(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
    room.on(RoomEvent.Disconnected, handleRoomDisconnected);
    room.on(RoomEvent.ConnectionStateChanged, handleConnectionStateChange);
    
    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
      room.off(RoomEvent.ParticipantDisconnected, handleParticipantDisconnected);
      room.off(RoomEvent.Disconnected, handleRoomDisconnected);
      room.off(RoomEvent.ConnectionStateChanged, handleConnectionStateChange);
    };
  }, [room, onDisconnect]);

  return null;
};

const SimpleVoiceAssistant = () => {
  const { state, audioTrack } = useVoiceAssistant();
  return (
    <BarVisualizer
      state={state}
      barCount={7}
      trackRef={audioTrack}
      style={{ height: '300px' }}
    />
  );
};

export default RoomComponent;