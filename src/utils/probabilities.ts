import { ITile, TileState } from '../components/GameBoard';
import { getSurroundingCoords } from './coordinates';

export function calculateProbabilities(gameBoard: ITile[][], boardWidth: number, boardHeight: number): ITile[][] {
  let changed = false;
  for (let row = 0; row < boardHeight; row++) {
    if (changed) break; // if a change was made, recalculate probabilities again
    for (let col = 0; col < boardWidth; col++) {
      const currentTile = gameBoard[row][col]; //Currently looking at the probabilities of this tiles neighbors
      if (currentTile.adjacent === 0) continue; // No need to calculate probabilities if there are no adjacent mines
      const neighbors = getSurroundingCoords(row, col, boardWidth, boardHeight);
      const unopenedNeighbors = neighbors.filter((n) => gameBoard[n.row][n.col].state !== TileState.Opened);
      if (unopenedNeighbors.length === 0) continue; // No need to calculate probabilities if there are no unopened neighbors
      const guaranteedNeighbors = unopenedNeighbors.filter((n) => gameBoard[n.row][n.col].mineProbability === 100);
      if (currentTile.state === TileState.Opened) {
        if (currentTile.adjacent === unopenedNeighbors.length) {
          // If amount of adjacent mines is equal to adjacent tiles, all are mines
          for (const n of unopenedNeighbors) {
            if (gameBoard[n.row][n.col].mineProbability !== 100) {
              gameBoard[n.row][n.col].mineProbability = 100;
              changed = true;
            }
          }
          if (changed) break; // if a change was made, recalculate probabilities again
        }
        if (currentTile.adjacent === guaranteedNeighbors.length) {
          // If all adjacent mines are already known, the rest are safe
          for (const n of unopenedNeighbors) {
            if (gameBoard[n.row][n.col].mineProbability === 100) continue; // dont overwrite 100% probability
            if (gameBoard[n.row][n.col].mineProbability !== 0) {
              gameBoard[n.row][n.col].mineProbability = 0;
              changed = true;
            }
          }
          if (changed) break; // if a change was made, recalculate probabilities again
        }
        for (const n of unopenedNeighbors) {
          if (gameBoard[n.row][n.col].mineProbability === 100) continue; // dont overwrite 100% probability
          if (gameBoard[n.row][n.col].mineProbability === 0) continue; // dont overwrite 0% probability
          const neighborsWithoutMines = unopenedNeighbors.filter((n) => gameBoard[n.row][n.col].mineProbability !== 100);
          const newProbability = Math.round(((currentTile.adjacent - guaranteedNeighbors.length) / neighborsWithoutMines.length) * 100);
          const prevProbability = gameBoard[n.row][n.col].mineProbability;
          if (prevProbability === undefined || newProbability > prevProbability) {
            gameBoard[n.row][n.col].mineProbability = newProbability;
            changed = true;
          }
        }
      }
    }
  }
  if (changed) {
    return calculateProbabilities(gameBoard, boardWidth, boardHeight);
  }
  return [...gameBoard];
}
