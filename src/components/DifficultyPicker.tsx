import React from 'react';
import { Link } from 'react-router-dom';

export type Difficulty = 'easy' | 'medium' | 'hard';

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
      <button>
        <Link to={`/multiplayer/`}>Multiplayer</Link>
      </button>
    </div>
  );
};

export default DifficultyPicker;