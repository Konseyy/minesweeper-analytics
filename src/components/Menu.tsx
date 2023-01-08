import React from 'react';
import { Link } from 'react-router-dom';
import { useLocalstorage } from '../hooks/useLocalstorage';
import { secondsToMinuteString } from '../utils/formatTime';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type HighScores = {
  [difficulty: string]: { time: number; date: number };
};

const Menu = () => {
  const [highScores] = useLocalstorage<HighScores>('highScores', {});
  return (
    <div>
      <div className="difficultyPicker">
        <span>Choose difficulty</span>
        <div className="difficultyContainer">
          <Link to="/game/easy">
            <button className="difficultyButton">Easy</button>
          </Link>
          <Link to="/game/medium">
            <button className="difficultyButton">Medium</button>
          </Link>
          <Link to="/game/hard">
            <button className="difficultyButton">Hard</button>
          </Link>
        </div>
      </div>

      <div>
        <Link to={`/multiplayer/`}>
          <button className="multiplayerButton">Multiplayer (Chrome only)</button>
        </Link>
      </div>
      <div style={{ marginTop: 15 }}>
        <div>Highscores: </div>
        <table style={{ border: '1px solid black', borderCollapse: 'collapse', textAlign: 'center' }}>
          <thead>
            <tr>
              {['Difficulty', 'Time', 'Date'].map((title) => (
                <th style={{ border: '1px solid black', padding: 5 }}>{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(highScores).map(([difficulty, entry]) => {
              return (
                <tr>
                  <td style={{ border: '1px solid black', padding: '2px 8px' }}>{difficulty}</td>
                  <td style={{ border: '1px solid black', padding: '2px 8px' }}>{secondsToMinuteString(entry.time)}</td>
                  <td style={{ border: '1px solid black', padding: '2px 8px' }}>{new Date(entry.date).toLocaleString('en-UK')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Menu;
