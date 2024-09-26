'use client';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useLocalParticipant,
  useConnectionState,
} from '@livekit/components-react';
import { useState } from "react";
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { ConnectionState } from 'livekit-client';
import Image from 'next/image';
import voice from '../images/microphone-logo-image.png'

const HomePage = () => {
  const [token, setToken] = useState(null);
  const [url, setUrl] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
      <main className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {token === null ? (
          <>
          <div className='flex justify-center mb-4'>
          <Image
          src={voice}
          alt="Voice Assistant Logo"
          width={200}
          height={200}
          className="rounded-lg"
        /></div>
          <button
            onClick={async () => {
              const {accessToken, url} = await fetch('/api/get-participant-token').then(res => res.json());
              setToken(accessToken);
              setUrl(url);
            }}
            className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Connect to Voice Assistant
          </button>
          </>
        ) : (
          <LiveKitRoom
            token={token}
            serverUrl={url ?? undefined}
            connectOptions={{ autoSubscribe: true }}
          >
            <ActiveRoom />
          </LiveKitRoom>
        
        )}
      </main>
    </div>
  );
};

const ActiveRoom = () => {
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const connectionState = useConnectionState();

  const toggleMicrophone = () => {
    if (connectionState === ConnectionState.Connected) {
      localParticipant?.setMicrophoneEnabled(!isMicrophoneEnabled);
    }
  };

  return (
    <div className="space-y-6">
      <RoomAudioRenderer />
      <div className="flex flex-col items-center space-y-4">
        {connectionState === ConnectionState.Connecting ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-indigo-600 font-semibold">Connecting...</span>
          </div>
        ) : connectionState === ConnectionState.Connected ? (
          <>
            <button
              onClick={toggleMicrophone}
              className={`p-4 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${isMicrophoneEnabled
                  ? 'bg-red-500 hover:bg-red-600 focus:ring-red-500'
                  : 'bg-green-500 hover:bg-green-600 focus:ring-green-500'
                }`}
            >
              {isMicrophoneEnabled ? (
                <Mic className="w-8 h-8 text-white" />
              ) : (
                <MicOff className="w-8 h-8 text-white" />
              )}
            </button>
            <div className={`font-semibold ${isMicrophoneEnabled ? 'text-green-600' : 'text-red-600'}`}>
              {isMicrophoneEnabled ? 'Microphone Active' : 'Microphone Muted'}
            </div>
          </>
        ) : (
          <div className="text-red-600 font-semibold">
            <Loader2 className="w-8 h-8 animate-spin text-[#a7cefa]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;