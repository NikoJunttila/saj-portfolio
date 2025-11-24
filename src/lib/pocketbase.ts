import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://pocket.junttila.dev');

// Disable realtime connections to prevent HTTP/2 protocol errors
pb.autoCancellation(false);
