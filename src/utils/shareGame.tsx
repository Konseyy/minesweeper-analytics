import { ITile } from '../components/GameBoard';
import { getSurroundingCoords } from './coordinates';
import { calculateProbabilities } from './probabilities';

function replaceDuplicates(gridString: string) {
  for (let i = 0; i < gridString.length; i++) {
    if (gridString[i] === gridString[i + 1]) {
      const char = gridString[i];
      let count = 1;
      let j = i;
      while (gridString[j] === gridString[j + 1]) {
        count++;
        j++;
      }
      gridString = gridString.substring(0, i) + count + char + gridString.substring(j + 1, gridString.length);
    }
  }
  return gridString;
}

export function encodeGrid(grid: ITile[][], timer: number): string {
  const width = grid[0].length;
  const mappedGrid = grid
    .map((row) => {
      return row
        .map((tile) => {
          if (tile.mine) {
            if (tile.state === 'flagged') return 'X';
            return 'M';
          }
          if (tile.state === 'opened') return 'O';
          if (tile.state === 'flagged') return 'F';
          return 'H';
        })
        .join('');
    })
    .join('');
  const reducedGrid = replaceDuplicates(mappedGrid);
  return `${width}-${timer}-${reducedGrid}`;
}
export function decodeGrid(encodedString: string): { grid: ITile[][]; timer: number } {
  const splitInfo = encodedString.split('-');
  const width = parseInt(splitInfo[0]);
  const timer = parseInt(splitInfo[1]);
  let gridString = splitInfo[2];
  for (let i = 0, j; i < gridString.length; i++) {
    if (!isNaN(parseInt(gridString[i]))) {
      let num = gridString[i];
      for (j = i + 1; j < gridString.length; j++) {
        if (isNaN(parseInt(gridString[j]))) {
          break;
        }
        num += gridString[j];
      }
      gridString = gridString.substring(0, i) + gridString[j].repeat(parseInt(num)) + gridString.substring(j + 1, gridString.length);
    }
  }
  const height = gridString.length / width;
  const grid: ITile[][] = [];
  for (let i = 0; i < height; i++) {
    grid.push([]);
    for (let j = 0; j < width; j++) {
      const char = gridString[i * width + j];
      let tile: ITile = {
        mine: false,
        state: 'hidden',
        adjacent: 0,
      };
      if (char === 'M' || char === 'X') {
        tile.mine = true;
      }
      if (char === 'O') {
        tile.state = 'opened';
      }
      if (char === 'F' || char === 'X') {
        tile.state = 'flagged';
      }
      grid[i].push(tile);
    }
  }
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const tile = grid[i][j];
      const adjacentCoords = getSurroundingCoords(i, j, width, height);
      const adjacentTiles = adjacentCoords.map((coords) => {
        return grid[coords.row][coords.col];
      });
      tile.adjacent = adjacentTiles.filter((tile) => tile.mine).length;
    }
  }
  const probabilityGrid = calculateProbabilities(grid, width, height, -1);

  return { grid: probabilityGrid, timer };
}
