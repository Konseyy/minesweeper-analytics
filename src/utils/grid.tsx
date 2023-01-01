import z from 'zod';
export function getStartingGrid(height: number, width: number) {
  const grid = Array(height);
  for (let row = 0; row < height; row++) {
    grid[row] = Array(width);
    for (let col = 0; col < width; col++) {
      grid[row][col] = getDefaultTile();
    }
  }
  return grid;
}

const DEFAULT_TILE = {
  mine: false,
  state: 'hidden',
  adjacent: 0,
};

function getDefaultTile() {
  return { ...DEFAULT_TILE };
}

export const EASY_WIDTH = 8;
export const EASY_HEIGHT = 13;
export const EASY_MINES = 0.1;

export const MEDIUM_WIDTH = 12;
export const MEDIUM_HEIGHT = 16;
export const MEDIUM_MINES = 0.2;

export const HARD_WIDTH = 20;
export const HARD_HEIGHT = 28;
export const HARD_MINES = 0.3;

export const receivedDataValidator = z.union([
  z.object({
    type: z.literal('grid'),
    data: z.array(z.array(z.any())),
  }),
  z.object({
    type: z.literal('state'),
    data: z.object({
      won: z.boolean(),
    }),
  }),
]);

export type P2PMessageType = z.infer<typeof receivedDataValidator>;
