import { DataConnection } from 'peerjs';
import React, { useState } from 'react';
import { v4 } from 'uuid';
import { usePeer } from '../hooks/usePeer';
import GameBoard from './GameBoard';
const senderId = v4();

const Sender = ({ otherId }: { otherId: string }) => {
  const localPeer = usePeer(senderId);
  const [connected, setConnected] = useState(false);
  const [connection, setConnection] = useState<DataConnection | null>(null);

  localPeer.on('open', () => {
    const con = localPeer.connect(otherId);
    setConnection(con);
    con.on('open', () => {
      setConnected(true);
      con.send('first message from sender');
    });
  });

  return (
    <div>
      <button
        onClick={() => {
          console.log(connection);
          connection?.send('hi');
        }}
      >
        Click to send
      </button>
      {connected ? (
        <>
          <GameBoard />
        </>
      ) : (
        <>
          <div>{localPeer.id}</div>
          Sender
        </>
      )}
    </div>
  );
};

export default Sender;
