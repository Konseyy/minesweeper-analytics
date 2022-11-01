import React from 'react';
import { ITile, TileState } from './GameBoard';
const TILE_SIZE = 30;

const Tile = ({
  tile,
  handleLeftClick,
  handleRightClick,
  gameOver,
}: {
  tile: ITile;
  handleLeftClick(): void;
  handleRightClick(): void;
  gameOver: boolean;
}) => {
  const getTileClassName = () => {
    // Tile opened
    if (tile.state === TileState.Opened) {
      // Opened mine
      if (tile.mine) {
        if (gameOver) {
          return 'redBomb';
        }
        return 'bomb';
      }
      // Opened empty tile
      if (tile.adjacent > 0) {
        switch (tile.adjacent) {
          case 1:
            return 'adj-1';
          case 2:
            return 'adj-2';
          case 3:
            return 'adj-3';
          case 4:
            return 'adj-4';
          case 5:
            return 'adj-5';
          case 6:
            return 'adj-6';
          case 7:
            return 'adj-7';
          case 8:
            return 'adj-8';
        }
      }
      return 'adj-0';
    }
    // Tile flagged
    if (tile.state === TileState.Flagged) {
      return 'flagged';
    }
    if (gameOver && tile.mine) {
      return 'bomb';
    }
    // Tile unopened
    return 'unopened';
    // return tile.mine ? 'X' : '?';
  };
  return (
    <div
      onClick={handleLeftClick}
      onContextMenu={(e) => {
        e.preventDefault();
        handleRightClick();
      }}
      className={`tile ${getTileClassName()}`}
      style={{ height: TILE_SIZE, width: TILE_SIZE }}
    />
  );
};

export default Tile;
