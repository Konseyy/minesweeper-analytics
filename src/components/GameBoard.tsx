import React, { FC, useEffect, useState } from 'react';
import { calculateProbabilities } from '../utils/probabilities';
import { coordsToIndex, getSurroundingCoords, indexToCoords } from '../utils/coordinates';
import { Difficulty } from './DifficultyPicker';
import Tile from './Tile';
import { useParams, Link, useSearchParams, useNavigate } from 'react-router-dom';
import { decodeGrid, encodeGrid } from '../utils/shareGame';
import {
  EASY_HEIGHT,
  EASY_MINES,
  EASY_WIDTH,
  getStartingGrid,
  HARD_HEIGHT,
  HARD_MINES,
  HARD_WIDTH,
  MEDIUM_HEIGHT,
  MEDIUM_MINES,
  MEDIUM_WIDTH,
} from '../utils/grid';
type TileState = 'hidden' | 'opened' | 'flagged';

export interface ITile {
  mine: boolean;
  state: TileState;
  adjacent: number;
  mineProbability?: number;
  changedOnTurnIdentifier?: number; // Keep track of which turn the tile probability was last changed.
}

interface GameBoardProps {
  height?: number;
  width?: number;
  minePercentage?: number;
}

type MultiplayerGameBoardProps =
  | (GameBoardProps & {
      multiplayer: true;
      local: true;
      sendGridUpdate: (grid: ITile[][]) => void;
      sendGameStateUpdate: (won: boolean) => void;
    })
  | {
      multiplayer: true;
      local: false;
      receivedState: ITile[][];
    };

let leftClickCount = 0;
let timerTracker: number | null = null;

const GameBoard: FC<GameBoardProps | MultiplayerGameBoardProps> = (props) => {
  const navigate = useNavigate();
  const multiplayer = 'multiplayer' in props;
  const difficulty = useParams().difficulty as Difficulty;
  const height = difficulty === 'easy' ? EASY_HEIGHT : difficulty === 'medium' ? MEDIUM_HEIGHT : HARD_HEIGHT;
  const width = difficulty === 'easy' ? EASY_WIDTH : difficulty === 'medium' ? MEDIUM_WIDTH : HARD_WIDTH;
  const minePercentage = difficulty === 'easy' ? EASY_MINES : difficulty === 'medium' ? MEDIUM_MINES : HARD_MINES;
  const TILE_COUNT = height * width;
  const MINE_COUNT = Math.floor(TILE_COUNT * minePercentage);
  const [queryParams, setQueryParams] = useSearchParams();
  // Create initial set of tiles
  const [grid, setGrid] = useState<ITile[][]>(getStartingGrid(height, width));
  const [firstClicked, setFirstClicked] = useState(false);
  const [showProbability, setShowProbability] = useState(false);
  const [remainingMines, setRemainingMines] = useState(MINE_COUNT);
  const [timer, setTimer] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const gridToDisplay = multiplayer && !props.local ? props.receivedState : grid;

  useEffect(() => {
    if (multiplayer) return;
    if ([...queryParams.keys()].includes('grid')) {
      try {
        const decodedGrid = decodeGrid(queryParams.get('grid')!);
        setGrid(decodedGrid.grid);
        setTimer(decodedGrid.timer);
        setFirstClicked(true);
        setQueryParams({});
        setRemainingMines(MINE_COUNT - decodedGrid.grid.flat().filter((tile) => tile.state === 'flagged').length);
      } catch (e) {
        console.error(e);
      }
    }
    timerTracker = window.setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
    return () => {
      clearInterval(timerTracker ?? 0);
    };
  }, []);

  useEffect(() => {
    if (multiplayer && props.local) {
      props.sendGridUpdate(grid);
    }
  }, [grid]);

  useEffect(() => {
    if (multiplayer && !props.local) {
      const flags = gridToDisplay.flat().filter((tile) => tile.state === 'flagged').length;
      setRemainingMines(Math.max(MINE_COUNT - flags, 0));
    }
  }, [gridToDisplay]);

  function shareGame() {
    const text = encodeGrid(grid, timer);
    navigator.clipboard.writeText(`${window.location.origin}/#/game/${difficulty}?grid=${text}`);
    alert('Game link copied to clipboard');
  }

  function endGame(won: boolean) {
    if (timerTracker !== null) clearInterval(timerTracker);

    if (!multiplayer) {
      const highScores = localStorage.getItem('highScores');
      if (highScores) {
        const parsed = JSON.parse(highScores);
        if (parsed[difficulty!] === undefined || timer < parsed[difficulty!].time) {
          parsed[difficulty!] = { time: timer, date: Date.now() };
          localStorage.setItem('highScores', JSON.stringify(parsed));
        }
      }
      const newHighScores = {
        [difficulty!]: { time: timer, date: Date.now() },
      };
      localStorage.setItem('highScores', JSON.stringify(newHighScores));
    }

    setGameOver(true);
    if (won) {
      if (multiplayer && props.local) props.sendGameStateUpdate(true);
      alert(`You won! (${timer}s)`);
    } else {
      if (multiplayer && props.local) props.sendGameStateUpdate(false);
      alert(`You lost! (${timer}s)`);
    }
    if (multiplayer) {
      navigate('/');
    }
  }

  function cascadeOpen(row: number, col: number, grid: ITile[][]) {
    grid = [...grid];
    if (grid[row][col].state === 'opened') return grid;
    grid[row][col].state = 'opened';
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
    const firstClickArea = getSurroundingCoords(clickRow, clickCol, width, height, { length: 2, includeSelf: true });
    const firstClickAreaIndexes = firstClickArea.map((coord) => coordsToIndex(coord.row, coord.col, width));
    const filteredIndexes = allIndexes.filter((index) => !firstClickAreaIndexes.includes(index));

    // Generate mine indexes
    for (let i = 0; i < MINE_COUNT; i++) {
      const randomIndex = Math.floor(Math.random() * filteredIndexes.length);
      mineIndexes.push(filteredIndexes[randomIndex]);
      filteredIndexes.splice(randomIndex, 1);
    }
    // Create starting point for new set of tiles
    const newGrid = getStartingGrid(height, width);
    for (let i = 0; i < TILE_COUNT; i++) {
      if (mineIndexes.includes(i)) {
        const row = Math.floor(i / width);
        const col = i % width;
        newGrid[row][col] = {
          mine: true,
          state: 'hidden',
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
    console.time('calculateProbabilities');
    setGrid(calculateProbabilities(cascadeOpen(clickRow, clickCol, newGrid), width, height, leftClickCount));
    console.timeEnd('calculateProbabilities');
  }

  function handleLeftClick(row: number, col: number) {
    if (multiplayer && !props.local) return;
    if (gameOver) return;
    leftClickCount++;
    console.log('leftclicked tile', { row, col }, grid[row][col]);
    if (grid[row][col].state === 'opened') {
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
    const newGrid = cascadeOpen(row, col, grid);
    console.time('calculateProbabilities');
    setGrid(calculateProbabilities(newGrid, width, height, leftClickCount));
    console.timeEnd('calculateProbabilities');

    // If tile is a mine, game over
    if (grid[row][col].mine) {
      console.log('game over');
      endGame(false);
      return;
    }

    // Check if any open tiles remaining
    for (let i = 0; i < TILE_COUNT; i++) {
      const { row, col } = indexToCoords(i, width);
      if (grid[row][col].state === 'hidden' && !grid[row][col].mine) {
        return;
      }
    }
    console.log('you win');
    endGame(true);
  }

  function handleRightClick(row: number, col: number) {
    if (multiplayer && !props.local) return;
    if (gameOver) return;
    console.log('rightclicked tile', { row, col }, grid[row][col]);
    if (grid[row][col].state === 'opened') {
      return;
    }
    const newGrid = [...grid];
    const tile = newGrid[row][col];
    if (tile.state === 'hidden') {
      setRemainingMines((old) => old - 1);
      tile.state = 'flagged';
    } else {
      setRemainingMines((old) => old + 1);
      tile.state = 'hidden';
    }
    setGrid(newGrid);
  }

  return (
    <div className="gameBoard">
      <header>
        {!multiplayer && (
          <button>
            <Link to="/">Back to menu</Link>
          </button>
        )}
        {firstClicked && !multiplayer && (
          <div>
            <button onClick={shareGame}>share</button>
          </div>
        )}
        {!multiplayer && (
          <div>
            <button onClick={() => setShowProbability((old) => !old)}>
              {showProbability ? 'Showing probabilities' : 'Not showing probabilities'}
            </button>
          </div>
        )}
        {!multiplayer && <div className="timer">{timer}s</div>}
        <div>Remaining mines: {remainingMines}</div>
      </header>
      <main>
        {gridToDisplay.map((row, rowIndex) => {
          return (
            <div key={rowIndex} className="row" style={{ display: 'flex' }}>
              {row.map((tile, colIndex) => {
                return (
                  <Tile
                    showProbability={showProbability}
                    gameOver={gameOver}
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
