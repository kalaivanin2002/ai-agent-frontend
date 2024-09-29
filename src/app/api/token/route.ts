import { AccessToken } from 'livekit-server-sdk';
import crypto from 'crypto';

export async function GET(request: Request) {
  // Extract user identity from the request, or generate a random one if not provided
  const url = new URL(request.url);
  const userIdentity = url.searchParams.get('identity') || generateRandomIdentity();

  const roomName = generateUniqueRoomName();
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return new Response('Server configuration error', { status: 500 });
  }

  const at = new AccessToken(apiKey, apiSecret, { identity: userIdentity });
  at.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canPublishData: true,
    canSubscribe: true,
  });

  return Response.json({ 
    accessToken: await at.toJwt(), 
    url: process.env.LIVEKIT_URL,
    identity: userIdentity,
    room: roomName
  });
}

function generateRandomIdentity(): string {
  return `user_${crypto.randomBytes(8).toString('hex')}`;
}

function generateUniqueRoomName(): string {
  const timestamp = Date.now().toString(36);
  const randomString = Math.random().toString(36).substring(2, 7);
  return `room_${timestamp}_${randomString}`;
}