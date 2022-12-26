import React from 'react';
import { Link } from 'react-router-dom';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'menu' | 'playing' | 'won' | 'lost';

const DifficultyPicker = () => {
  return (
    <div style={{ display: 'flex', gap: '5px' }}>
      <button>
        <Link to="/game/easy">Easy</Link>
      </button>
      <button>
        <Link to="/game/medium">Medium</Link>
      </button>
      <button>
        <Link to="/game/hard">Hard</Link>
      </button>
    </div>
  );
};

export default DifficultyPicker;
