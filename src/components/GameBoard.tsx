import React, { FC, useState } from 'react';
import { coordsToIndex, getSurroundingCoords, indexToCoords } from '../utils';
import { Difficulty, GameState } from './Controller';
import Tile from './Tile';

export enum TileState {
  Hidden,
  Opened,
  Flagged,
}

export interface ITile {
  mine: boolean;
  state: TileState;
  adjacent: number;
  mineProbability?: number;
}

const DEFAULT_TILE = {
  mine: false,
  state: TileState.Hidden,
  adjacent: 0,
};

function getDefaultTile() {
  return { ...DEFAULT_TILE };
}

interface GameBoardProps {
  height?: number;
  width?: number;
  minePercentage?: number;
  onWin: () => void;
  onLose: () => void;
  gameState: GameState;
  setGameState: (gameState: GameState) => void;
  onMenu: () => void;
  difficulty: Difficulty;
  timer: number;
}

const GameBoard: FC<GameBoardProps> = ({ onWin, onLose, gameState, setGameState, onMenu, difficulty, timer }) => {
  const height = difficulty === 'easy' ? 13 : difficulty === 'medium' ? 16 : 28;
  const width = difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 20;
  const minePercentage = difficulty === 'easy' ? 0.1 : difficulty === 'medium' ? 0.2 : 0.3;
  const TILE_COUNT = height * width;
  const MINE_COUNT = Math.floor(TILE_COUNT * minePercentage);
  // Create initial set of tiles
  const [grid, setGrid] = useState<ITile[][]>(getStartingGrid());
  const [firstClicked, setFirstClicked] = useState(false);

  function getStartingGrid() {
    const grid = Array(height);
    for (let row = 0; row < height; row++) {
      grid[row] = Array(width);
      for (let col = 0; col < width; col++) {
        grid[row][col] = getDefaultTile();
      }
    }
    return grid;
  }

  function cascadeOpen(row: number, col: number, grid: ITile[][]) {
    grid = [...grid];
    if (grid[row][col].state === TileState.Opened) return grid;
    grid[row][col].state = TileState.Opened;
    const tile = grid[row][col];
    if (tile.adjacent !== 0 || tile.mine) {
      return grid;
    }
    getSurroundingCoords(row, col, width, height).forEach((coordinate) => {
      const { row, col } = coordinate;
      grid = cascadeOpen(row, col, grid);
    });
    return grid;
  }

  // Populate grid with mines on initial click
  function generateMines(clickRow: number, clickCol: number) {
    console.log('Generating mines');
    const allIndexes = Array.from(Array(TILE_COUNT).keys());
    const mineIndexes = [];
    // Make sure first click area is not a mine
    const firstClickArea = getSurroundingCoords(clickRow, clickCol, width, height, 2);
    const firstClickAreaIndexes = firstClickArea.map((coord) => coordsToIndex(coord.row, coord.col, width));
    const filteredIndexes = allIndexes.filter((index) => !firstClickAreaIndexes.includes(index));

    // Generate mine indexes
    for (let i = 0; i < MINE_COUNT; i++) {
      const randomIndex = Math.floor(Math.random() * filteredIndexes.length);
      mineIndexes.push(filteredIndexes[randomIndex]);
      filteredIndexes.splice(randomIndex, 1);
    }
    // Create starting point for new set of tiles
    const newGrid = getStartingGrid();
    for (let i = 0; i < TILE_COUNT; i++) {
      if (mineIndexes.includes(i)) {
        const row = Math.floor(i / width);
        const col = i % width;
        newGrid[row][col] = {
          mine: true,
          state: TileState.Hidden,
          adjacent: 0,
        };
      }
    }
    // Set number of adjacent mines for each tile
    for (let i = 0; i < TILE_COUNT; i++) {
      // Get coords of mine in current iteration
      const { row, col } = indexToCoords(i, width);
      let adjacentMineCount = 0;
      const surroundingCoords = getSurroundingCoords(row, col, width, height);
      surroundingCoords.forEach((coordinate) => {
        if (coordinate.row === row && coordinate.col === col) return;
        if (newGrid[coordinate.row][coordinate.col].mine) {
          adjacentMineCount++;
        }
      });
      newGrid[row][col].adjacent = adjacentMineCount;
    }
    setGrid(cascadeOpen(clickRow, clickCol, newGrid));
  }

  function handleLeftClick(row: number, col: number) {
    if (gameState !== 'playing') return;
    console.log('leftclicked tile', { row, col }, grid[row][col]);
    if (grid[row][col].state === TileState.Opened) {
      console.log('tile already opened');
      return;
    }
    // If first click, generate mines
    if (!firstClicked) {
      setFirstClicked(true);
      generateMines(row, col);
      return;
    }

    // Open the tile
    setGrid(cascadeOpen(row, col, grid));

    // If tile is a mine, game over
    if (grid[row][col].mine) {
      console.log('game over');
      onLose();
      return;
    }

    // Check if any open tiles remaining
    for (let i = 0; i < TILE_COUNT; i++) {
      const { row, col } = indexToCoords(i, width);
      if (grid[row][col].state === TileState.Hidden && !grid[row][col].mine) {
        return;
      }
    }
    console.log('you win');
    onWin();
  }

  function handleRightClick(row: number, col: number) {
    if (gameState !== 'playing') return;
    console.log('rightclicked tile', { row, col }, grid[row][col]);
    if (grid[row][col].state === TileState.Opened) {
      console.log('tile already opened');
      return;
    }
    const newGrid = [...grid];
    const tile = newGrid[row][col];
    if (tile.state === TileState.Hidden) {
      tile.state = TileState.Flagged;
    } else {
      tile.state = TileState.Hidden;
    }
    setGrid(newGrid);
  }

  return (
    <div className="gameBoard">
      <header>
        <button onClick={onMenu}>Back to menu</button>
        <div className="timer">{timer}s</div>
      </header>
      <main>
        {grid.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="row" style={{ display: 'flex' }}>
              {row.map((tile, colIndex) => {
                return (
                  <Tile
                    gameOver={gameState !== 'playing'}
                    tile={tile}
                    key={colIndex}
                    handleLeftClick={() => handleLeftClick(rowIndex, colIndex)}
                    handleRightClick={() => handleRightClick(rowIndex, colIndex)}
                  />
                );
              })}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default GameBoard;
