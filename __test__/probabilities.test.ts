import { describe, expect, test } from '@jest/globals';
import { ITile } from '../src/components/GameBoard';
import { getDefaultTile } from '../src/utils/grid';
import { calculateProbabilities } from '../src/utils/probabilities';

function makeTile(state: number | false): ITile {
  const adjacent = typeof state === 'number';

  return { ...getDefaultTile(), adjacent: adjacent ? state : 0, state: adjacent ? 'opened' : 'hidden' };
}

function compareProbabilities(initialGrid: ITile[][], expectedProbabilityGrid: ITile['mineProbability'][][]) {
  const calculatedGrid = calculateProbabilities(initialGrid, initialGrid[0].length, initialGrid.length, -1);
  const calculatedProbabilityGrid = calculatedGrid.map((row) => row.map((tile) => tile.mineProbability));
  const probabilitiesMatched = expectedProbabilityGrid.every((row, rowIndex) =>
    row.every((prob, colIndex) => prob === calculatedProbabilityGrid[rowIndex][colIndex])
  );
  if (!probabilitiesMatched) {
    return calculatedProbabilityGrid;
  }
  return true;
}

describe('Test probability calculation', () => {
  test('Case 1', () => {
    /**
     * H H H 1
     * H 2 2 H
     * 1 1 1 1
     */
    const initialGrid = [
      [makeTile(false), makeTile(false), makeTile(false), makeTile(1)],
      [makeTile(false), makeTile(2), makeTile(2), makeTile(false)],
      [makeTile(1), makeTile(1), makeTile(1), makeTile(1)],
    ];
    const expectedProbabilities: Array<Array<number | undefined>> = [
      [0, 100, 0, undefined],
      [100, undefined, undefined, 100],
      [undefined, undefined, undefined, undefined],
    ];
    expect(compareProbabilities(initialGrid, expectedProbabilities)).toBe(true);
  });
  test('Case 2', () => {
    /**
     * H H H 1
     * 1 H H H
     * 1 H H H
     * 1 1 2 1
     */
    const initialGrid = [
      [makeTile(false), makeTile(false), makeTile(false), makeTile(1)],
      [makeTile(1), makeTile(false), makeTile(false), makeTile(false)],
      [makeTile(1), makeTile(false), makeTile(false), makeTile(false)],
      [makeTile(1), makeTile(1), makeTile(2), makeTile(1)],
    ];
    const expectedProbabilities: Array<Array<number | undefined>> = [
      [0, 0, 33, undefined],
      [undefined, 0, 33, 33],
      [undefined, 100, 0, 100],
      [undefined, undefined, undefined, undefined],
    ];
    expect(compareProbabilities(initialGrid, expectedProbabilities)).toBe(true);
  });
  test('Case 3', () => {
    /**
     * H 1 H
     * 1 2 1
     * H 1 H
     */
    const initialGrid = [
      [makeTile(false), makeTile(1), makeTile(false)],
      [makeTile(1), makeTile(2), makeTile(1)],
      [makeTile(false), makeTile(1), makeTile(false)],
    ];
    const expectedProbabilities: Array<Array<number | undefined>> = [
      [50, undefined, 50],
      [undefined, undefined, undefined],
      [50, undefined, 50],
    ];
    expect(compareProbabilities(initialGrid, expectedProbabilities)).toBe(true);
  });
  test('Case 4', () => {
    /**
     * H H H
     * H 4 H
     * H 3 H
     */
    const initialGrid = [
      [makeTile(false), makeTile(false), makeTile(false)],
      [makeTile(false), makeTile(4), makeTile(false)],
      [makeTile(false), makeTile(3), makeTile(false)],
    ];
    const expectedProbabilities: Array<Array<number | undefined>> = [
      [57, 57, 57],
      [75, undefined, 75],
      [75, undefined, 75],
    ];
    expect(compareProbabilities(initialGrid, expectedProbabilities)).toBe(true);
  });
  test('Case 5', () => {
    /**
     * 1 H H
     * H 4 H
     * H 3 H
     */
    const initialGrid = [
      [makeTile(1), makeTile(false), makeTile(false)],
      [makeTile(false), makeTile(4), makeTile(false)],
      [makeTile(false), makeTile(3), makeTile(false)],
    ];
    const expectedProbabilities: Array<Array<number | undefined>> = [
      [undefined, 67, 67],
      [75, undefined, 75],
      [75, undefined, 75],
    ];
    expect(compareProbabilities(initialGrid, expectedProbabilities)).toBe(true);
  });
  test('Case 6', () => {
    /**
     * 2 H H
     * H 4 H
     * H 3 H
     */
    const initialGrid = [
      [makeTile(2), makeTile(false), makeTile(false)],
      [makeTile(false), makeTile(4), makeTile(false)],
      [makeTile(false), makeTile(3), makeTile(false)],
    ];
    const expectedProbabilities: Array<Array<number | undefined>> = [
      [undefined, 100, 50],
      [100, undefined, 67],
      [67, undefined, 67],
    ];
    expect(compareProbabilities(initialGrid, expectedProbabilities)).toBe(true);
  });
  test('Case 7', () => {
    /**
     * 2 H 1
     * H 3 1
     * H 2 H
     */
    const initialGrid = [
      [makeTile(2), makeTile(false), makeTile(1)],
      [makeTile(false), makeTile(3), makeTile(1)],
      [makeTile(false), makeTile(2), makeTile(false)],
    ];
    const expectedProbabilities: Array<Array<number | undefined>> = [
      [undefined, 100, undefined],
      [100, undefined, undefined],
      [100, undefined, 0],
    ];
    expect(compareProbabilities(initialGrid, expectedProbabilities)).toBe(true);
  });
  test('Case 8', () => {
    /**
     * 1 H H
     * 1 2 2
     * H H H
     */
    const initialGrid = [
      [makeTile(1), makeTile(false), makeTile(false)],
      [makeTile(1), makeTile(2), makeTile(2)],
      [makeTile(false), makeTile(false), makeTile(false)],
    ];
    const expectedProbabilities: Array<Array<number | undefined>> = [
      [undefined, 100, 50],
      [undefined, undefined, undefined],
      [0, 0, 50],
    ];
    expect(compareProbabilities(initialGrid, expectedProbabilities)).toBe(true);
  });
  test('Case 9', () => {
    /**
     * H H H
     * 2 3 2
     * H H H
     */
    const initialGrid = [
      [makeTile(false), makeTile(false), makeTile(false)],
      [makeTile(2), makeTile(3), makeTile(2)],
      [makeTile(false), makeTile(false), makeTile(false)],
    ];
    const expectedProbabilities: Array<Array<number | undefined>> = [
      [50, 50, 50],
      [undefined, undefined, undefined],
      [50, 50, 50],
    ];
    expect(compareProbabilities(initialGrid, expectedProbabilities)).toBe(true);
  });
  test('Case 10', () => {
    /**
     * H H H
     * H 1 H
     * H H H
     */
    const initialGrid = [
      [makeTile(false), makeTile(false), makeTile(false)],
      [makeTile(false), makeTile(1), makeTile(false)],
      [makeTile(false), makeTile(false), makeTile(false)],
    ];
    const expectedProbabilities: Array<Array<number | undefined>> = [
      [13, 13, 13],
      [13, undefined, 13],
      [13, 13, 13],
    ];
    expect(compareProbabilities(initialGrid, expectedProbabilities)).toBe(true);
  });
});
