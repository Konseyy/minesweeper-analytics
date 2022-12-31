import React, { useState } from 'react';
import { v4 } from 'uuid';
import { usePeer } from '../hooks/usePeer';
import GameBoard from './GameBoard';
const receiverId = v4();

const Receiver = () => {
  const localPeer = usePeer(receiverId);
  const [connected, setConnected] = useState(false);

  localPeer.on('open', (id) => {
    console.log('Receiver ready', id);
  });
  localPeer.on('connection', (connection) => {
    connection.on('data', (data) => {
      console.log('data', data);
    });
    connection.on('open', () => {
      setConnected(true);
      console.log('open receiver');
    });
    connection.on('error', (err) => {
      console.error('error receiver', err);
    });
  });
  return (
    <div>
      {connected ? (
        <GameBoard />
      ) : (
        <>
          <div>{localPeer.id}</div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/#/multiplayer?id=${localPeer.id}`);
            }}
          >
            Copy Link
          </button>
          Receiver
        </>
      )}
    </div>
  );
};

export default Receiver;
