'use client';
import {
  BarVisualizer,
  LiveKitRoom,
  RoomAudioRenderer,
  useVoiceAssistant,
  VoiceAssistantControlBar,
  useRoomContext,
} from '@livekit/components-react';
import "@livekit/components-styles";
import { useState, useEffect } from "react";
import { RoomEvent, Participant, Room } from 'livekit-client';

const RoomComponent = () => {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  return (
    <main data-lk-theme="default">
      {token === null ? (
        <div className="lk-focus-layout">
          <button className="lk-button" onClick={async () => {
            const {accessToken, url} = await fetch('/api/token').then(res => res.json());
            setToken(accessToken);
            setUrl(url);
          }}>Connect</button>
        </div>
      ) : ( 
        <LiveKitRoom
          token={token}
          serverUrl={url ?? undefined}
          connectOptions={{autoSubscribe: true}}
          data-lk-theme="default"
          style={{ height: '100dvh' }}
        >   
          <RoomEventLogger />
          <SimpleVoiceAssistant />
          <VoiceAssistantControlBar />
          <RoomAudioRenderer />
        </LiveKitRoom>
      )}  
    </main>
  );  
};

const RoomEventLogger = () => {
  const room = useRoomContext();

  useEffect(() => {
    const handleParticipantConnected = (participant: Participant) => {
      if (participant === room.localParticipant) {
        console.log('Local participant joined:', participant.identity);
      } else {
        console.log('Remote participant (agent) joined:', participant.identity);
      }
    };

    const logConnectedParticipants = (room: Room) => {
      if (room.state === 'connected') {
        console.log('Local participant joined:', room.localParticipant.identity);
        room.remoteParticipants.forEach((participant) => {
          console.log('Remote participant (agent) already in room:', participant.identity);
        });
      }
    };

    room.on(RoomEvent.ParticipantConnected, handleParticipantConnected);
    
    // Log already connected participants
    logConnectedParticipants(room);

    return () => {
      room.off(RoomEvent.ParticipantConnected, handleParticipantConnected);
    };
  }, [room]);

  return null; // This component doesn't render anything
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