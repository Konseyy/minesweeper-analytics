import { Peer } from 'peerjs';
import { useRef } from 'react';

export function usePeer(id: string) {
  const peer = useRef<Peer>();
  if (!peer.current) {
    peer.current = new Peer(id);
  }
  return peer.current;
}
