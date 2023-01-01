import { DataConnection } from 'peerjs';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';
import { usePeer } from '../hooks/usePeer';
import { P2PMessageType, receivedDataValidator } from '../utils/grid';
import { ITile } from './GameBoard';
import MultiplayerBoard from './MultiplayerBoard';
const receiverId = v4();

const Receiver = () => {
  const navigate = useNavigate();
  const localPeer = usePeer(receiverId);
  const [remoteState, setRemoteState] = useState<ITile[][]>([]);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [connected, setConnected] = useState(false);

  localPeer.on('open', (id) => {
    console.log('Receiver ready', id);
  });
  localPeer.on('connection', (con) => {
    setConnection(con);
    con.on('data', (data) => {
      console.log('data received', data);
      const validated = receivedDataValidator.safeParse(data);
      if (validated.success) {
        switch (validated.data.type) {
          case 'grid':
            setRemoteState(validated.data.data);
            break;
          case 'state':
            if (validated.data.data.won) {
              alert('Opponent won!');
            } else {
              alert('Opponent lost!');
            }
            navigate('/');
            break;
        }
      } else {
        console.error('invalid data', validated.error);
      }
      console.log('data received', data);
    });
    con.on('open', () => {
      localPeer.disconnect(); // Dont accept any more connections
      setConnected(true);
      console.log('Connection opened');
    });
    con.on('error', (err) => {
      console.error('error receiver', err);
    });
    con.on('close', () => {
      setConnected(false);
    });
  });

  function sendData(data: P2PMessageType) {
    connection?.send(data);
  }
  return (
    <div>
      {connected ? (
        <MultiplayerBoard receivedState={remoteState} sendData={sendData} />
      ) : (
        <>
          <div>{localPeer.id}</div>
          <button
            onClick={() => {
              console.log(localPeer, connection);
              navigator.clipboard.writeText(`${window.location.origin}/#/multiplayer?id=${localPeer.id}`);
            }}
          >
            Copy Link
          </button>
        </>
      )}
    </div>
  );
};

export default Receiver;
