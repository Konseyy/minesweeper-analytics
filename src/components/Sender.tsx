import { DataConnection } from 'peerjs';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 } from 'uuid';
import { usePeer } from '../hooks/usePeer';
import { P2PMessageType, receivedDataValidator } from '../utils/grid';
import { ITile } from './GameBoard';
import MultiplayerBoard from './MultiplayerBoard';

const Sender = ({ otherId }: { otherId: string }) => {
  const senderId = useRef(v4()).current;
  const navigate = useNavigate();
  const localPeer = usePeer(senderId);
  const [connected, setConnected] = useState(false);
  const [remoteState, setRemoteState] = useState<ITile[][]>([]);
  const [connection, setConnection] = useState<DataConnection | null>(null);

  useEffect(() => {
    return () => {
      connection?.close();
    };
  }, [connection]);

  useEffect(() => {
    localPeer.on('open', setupPeer);
    return () => {
      localPeer.destroy();
    };
  }, [localPeer]);

  function setupPeer() {
    const con = localPeer.connect(otherId);
    setConnection(con);
    con.on('open', () => {
      localPeer.disconnect(); // Dont accept any more connections
      setConnected(true);
      console.log('Connection opened');
    });
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
    });
    con.on('error', (err) => {
      console.error('error receiver', err);
    });
    con.on('close', () => {
      localPeer.reconnect();
      setConnected(false);
      navigate('/');
    });
  }

  function sendData(data: P2PMessageType) {
    connection?.send(data);
  }

  return (
    <div>
      {connected ? (
        <>
          <MultiplayerBoard receivedState={remoteState} sendData={sendData} />
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
