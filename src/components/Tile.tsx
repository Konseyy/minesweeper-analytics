import React from 'react';
import { ITile } from './GameBoard';
const TILE_SIZE = 30;
const PROBABILITY_OPACITY_COEFFICIENT = 0.75;

const Tile = ({
  tile,
  handleLeftClick,
  handleRightClick,
  gameOver,
  showProbability,
}: {
  tile: ITile;
  handleLeftClick(): void;
  handleRightClick(): void;
  gameOver: boolean;
  showProbability: boolean;
}) => {
  const getTileClassName = () => {
    // Tile opened
    if (tile.state === 'opened') {
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
    // After game is over show all mines
    if (gameOver && tile.mine) {
      return 'bomb';
    }
    // Tile flagged
    if (tile.state === 'flagged') {
      return 'flagged';
    }
    // Tile unopened
    return 'unopened';
    // return tile.mine ? 'X' : '?';
  };
  return (
    <div style={{ position: 'relative', height: TILE_SIZE, width: TILE_SIZE }} className={`tile ${getTileClassName()}`}>
      <div
        onClick={handleLeftClick}
        onContextMenu={(e) => {
          e.preventDefault();
          handleRightClick();
        }}
        style={{ position: 'absolute', height: '100%', width: '100%' }}
      />
      {showProbability && tile.state !== 'opened' && <Probability probability={tile.mineProbability} />}
    </div>
  );
};

const Probability = ({ probability }: { probability: ITile['mineProbability'] }) => {
  const getDisplayedProbability = () => {
    switch (probability) {
      case undefined:
        return '?';
      default:
        return probability;
    }
  };
  if (probability === undefined) return null;
  const getBackgroundColor = () => {
    return `rgba(255,0,0,${(probability / 100) * PROBABILITY_OPACITY_COEFFICIENT})`;
  };
  return (
    <div className="probability" style={{ backgroundColor: probability !== 0 ? getBackgroundColor() : 'rgba(0, 128, 0, .6)' }}>
      {getDisplayedProbability()}
    </div>
  );
};

export default Tile;
