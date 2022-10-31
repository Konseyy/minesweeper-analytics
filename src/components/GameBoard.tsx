import React, { FC, useState } from 'react';
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

const DEFAULT_WIDTH = 15 as const;
const DEFAULT_HEIGHT = 25 as const;
const DEFAULT_MINE_PERCENTAGE = 0.2 as const;

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
  onWin?: () => void;
  onLose?: () => void;
}

const GameBoard: FC<GameBoardProps> = ({
  height = DEFAULT_HEIGHT,
  width = DEFAULT_WIDTH,
  minePercentage = DEFAULT_MINE_PERCENTAGE,
  onWin,
  onLose,
}) => {
  const TILE_COUNT = height * width;
  const MINE_COUNT = Math.floor(TILE_COUNT * minePercentage);
  // Create initial set of tiles
  const [grid, setGrid] = useState<ITile[][]>(getStartingGrid());
  const [firstClicked, setFirstClicked] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  function restartGame() {
    setGrid(getStartingGrid());
    setFirstClicked(false);
    setGameOver(false);
  }

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

  function coordsToIndex(row: number, col: number) {
    return row * width + col;
  }

  function indexToCoords(index: number) {
    const row = Math.floor(index / width);
    const col = index % width;
    return { row, col };
  }

  // Returns coordinates of existing tiles around the given tile
  function getSurroundingCoords(row: number, col: number, length?: number) {
    const searchLength = length ?? 1;
    const possibleRows = [row];
    for (let i = 1; i < searchLength + 1; i++) {
      possibleRows.push(row - i, row + i);
    }
    const existingRows = possibleRows.filter((r) => r >= 0 && r < height);
    const possibleCols = [col];
    for (let i = 1; i < searchLength + 1; i++) {
      possibleCols.push(col - i, col + i);
    }
    const existingCols = possibleCols.filter((c) => c >= 0 && c < width);
    const adjcentCoords: { row: number; col: number }[] = [];
    for (const r of existingRows) {
      for (const c of existingCols) {
        adjcentCoords.push({ row: r, col: c });
      }
    }
    return adjcentCoords;
  }

  function cascadeOpen(row: number, col: number, grid: ITile[][]) {
    grid = [...grid];
    if (grid[row][col].state === TileState.Opened) return grid;
    grid[row][col].state = TileState.Opened;
    const tile = grid[row][col];
    if (tile.adjacent !== 0 || tile.mine) {
      return grid;
    }
    getSurroundingCoords(row, col).forEach((coordinate) => {
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
    const firstClickArea = getSurroundingCoords(clickRow, clickCol, 2);
    const firstClickAreaIndexes = firstClickArea.map((coord) => coordsToIndex(coord.row, coord.col));
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
      const { row, col } = indexToCoords(i);
      let adjacentMineCount = 0;
      const surroundingCoords = getSurroundingCoords(row, col);
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
    console.log('clicked tile', { row, col }, grid[row][col]);
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
      onLose?.();
      setGameOver(true);
      return;
    }

    // Bubble open adjacent tiles

    // If no more mines unflagged mines remaining, game won
    // TODO - check if all mines are flagged
  }
  return (
    <div className="gameBoard">
      <header>
        <button onClick={restartGame}>Restart Game</button>
      </header>
      <main>
        {grid.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="row" style={{ display: 'flex' }}>
              {row.map((tile, colIndex) => {
                return <Tile gameOver={gameOver} tile={tile} key={colIndex} handleLeftClick={() => handleLeftClick(rowIndex, colIndex)} />;
              })}
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default GameBoard;
