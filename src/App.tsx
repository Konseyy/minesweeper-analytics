import './App.css';
import DifficultyPicker from './components/Controller';
import { createHashRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom';
import GameBoard from './components/GameBoard';

function App() {
  const router = createHashRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Navigate to={'/difficulty'} />}></Route>
        <Route index path="difficulty" element={<DifficultyPicker />} />
        <Route path="game/:difficulty" element={<GameBoard />} />
      </>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
