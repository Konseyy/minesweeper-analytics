import React from 'react';
import { ITile, TileState } from './GameBoard';
const TILE_SIZE = 20;

const Tile = ({ tile, handleLeftClick, gameOver }: { tile: ITile; handleLeftClick(): void; gameOver: boolean }) => {
  const getTileClassName = () => {
    // Tile opened
    if (tile.state === TileState.Opened) {
      // Opened mine
      if (tile.mine) {
        return '💣';
      }
      // Opened empty tile
      if (tile.adjacent > 0) {
        return tile.adjacent;
      }
      return 'O';
    }
    // Tile flagged
    if (tile.state === TileState.Flagged) {
      return '🚩';
    }
    // Tile unopened
    return '?';
    return tile.mine ? 'X' : '?';
  };
  return (
    <div onClick={handleLeftClick} className="tile" style={{ height: TILE_SIZE, width: TILE_SIZE, cursor: 'pointer' }}>
      {getTileClassName()}
    </div>
  );
};

export default Tile;
