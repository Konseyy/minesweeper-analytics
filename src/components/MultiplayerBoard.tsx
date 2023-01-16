import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import GameBoard, { ITile } from './GameBoard';
import { P2PMessageType } from '../utils/grid';

interface Props {
  receivedState: ITile[][];
  sendData: (data: P2PMessageType) => void;
  remoteGameOver: boolean;
}

const MultiplayerBoard: FC<Props> = ({ receivedState, sendData, remoteGameOver }) => {
  function updateGrid(gridState: ITile[][]) {
    sendData({ type: 'grid', data: gridState });
  }
  function updateGameState(won: boolean) {
    sendData({ type: 'state', data: { won } });
  }
  return (
    <div>
      <Link to="/">
        <button>Back to menu</button>
      </Link>
      <div style={{ display: 'flex', gap: 5 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>Your Board:</div>
          <GameBoard
            multiplayer
            local={true}
            sendGridUpdate={updateGrid}
            sendGameStateUpdate={updateGameState}
            remoteGameOver={remoteGameOver}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div>Opponents Board:</div>
          <GameBoard multiplayer local={false} receivedGrid={receivedState} gameOver={remoteGameOver} />
        </div>
      </div>
    </div>
  );
};

export default MultiplayerBoard;
