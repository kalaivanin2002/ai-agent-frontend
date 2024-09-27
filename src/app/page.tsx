'use client';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { useState, useCallback, useEffect } from "react";
import { ConnectionState } from 'livekit-client';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  const fetchToken = useCallback(async () => {
    try {
      const response = await fetch('/api/token');
      if (!response.ok) {
        throw new Error('Failed to fetch token');
      }
      const { accessToken, url } = await response.json();
      setToken(accessToken);
      setUrl(url);
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);

  return (
    <main>
      {error && <div>Error: {error}</div>}
      {!token && <button onClick={fetchToken}>Connect</button>}
      {token && url && (
        <LiveKitRoom
          token={token}
          serverUrl={url}
          connectOptions={{ autoSubscribe: true }}
          onDisconnected={() => setToken(null)}
        >
          <RoomController />
          <ActiveRoom />
        </LiveKitRoom>
      )}
    </main>
  );
}

const RoomController = () => {
  const connectionState = useConnectionState();

  useEffect(() => {
    if (connectionState === ConnectionState.Disconnected) {
      console.log('Disconnected from room');
      // Implement reconnection logic here if needed
    } else if (connectionState === ConnectionState.Connected) {
      console.log('Connected to room');
    }
  }, [connectionState]);

  return null;
};

const ActiveRoom = () => {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  const toggleMicrophone = useCallback(() => {
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  }, [localParticipant, isMicrophoneEnabled]);

  return (
    <>
      <RoomAudioRenderer />
      <button onClick={toggleMicrophone}>Toggle Microphone</button>
      <div>Audio Enabled: {isMicrophoneEnabled ? 'Unmuted' : 'Muted'}</div>
    </>
  );
};