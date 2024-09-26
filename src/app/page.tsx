'use client';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
} from '@livekit/components-react';
import { useState } from "react";


const HomePage = () => {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  return (
    <>
      <main>
        {token === null ? (<button onClick={async () => {
          const {accessToken, url} = await fetch('/api/get-participant-token').then(res => res.json());
          setToken(accessToken);
          setUrl(url);
        }}>Connect</button>) : (
          <LiveKitRoom
            token={token}
            serverUrl={url ?? undefined}
            connectOptions={{autoSubscribe: true}}
          >
            <ActiveRoom />
          </LiveKitRoom>
        )}
      </main>
    </>
  );
};

const ActiveRoom = () => {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  return (
    <>
      <RoomAudioRenderer />
      <button onClick={() => {
        localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled)
      }}>Toggle Microphone</button>
      <div>Audio Status: { isMicrophoneEnabled ? 'Unmuted' : 'Muted' }</div>
    </>
  );
};

export default HomePage;