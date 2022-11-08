import React, { useEffect, useState } from 'react';
import GameBoard from './GameBoard';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type GameState = 'menu' | 'playing' | 'won' | 'lost';

let timerTracker: number | null = null;

const Controller = () => {
  const [timer, setTimer] = useState(0);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [gameState, setGameState] = useState<GameState>('menu');

  useEffect(() => {
    return () => {
      clearInterval(timerTracker ?? 0);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'won') {
      alert(`You won! (${timer}s)`);
    }
    if (gameState === 'lost') {
      alert(`You lost! (${timer}s)`);
    }
  }, [gameState]);

  function startGame(difficulty: Difficulty) {
    setDifficulty(difficulty);
    setGameState('playing');
    setTimer(0);
    timerTracker = window.setInterval(() => {
      setTimer((timer) => timer + 1);
    }, 1000);
  }

  function endGame(won: boolean) {
    clearInterval(timerTracker!);
    setGameState(won ? 'won' : 'lost');
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

  function returnToMenu() {
    setDifficulty(null);
    clearInterval(timerTracker!);
    setTimer(0);
    setGameState('menu');
    setDifficulty(null);
  }

  if (gameState === 'menu' || difficulty === null) {
    return (
      <div style={{ display: 'flex', gap: '5px' }}>
        <button onClick={() => startGame('easy')}>Easy</button>
        <button onClick={() => startGame('medium')}>Medium</button>
        <button onClick={() => startGame('hard')}>Hard</button>
      </div>
    );
  }
  return (
    <GameBoard
      timer={timer}
      difficulty={difficulty}
      onMenu={returnToMenu}
      onLose={() => endGame(false)}
      onWin={() => endGame(true)}
      gameState={gameState}
      setGameState={setGameState}
    />
  );
};

export default Controller;
