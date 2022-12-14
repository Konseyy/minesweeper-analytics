import Menu from './components/Menu';
import { createHashRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom';
import GameBoard from './components/GameBoard';
import MultiplayerContainer from './components/MultiplayerContainer';

function App() {
  const router = createHashRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Menu />} />
        <Route path="game/:difficulty" element={<GameBoard />} />
        <Route path="multiplayer" element={<MultiplayerContainer />} />
      </>
    )
  );
  return <RouterProvider router={router} />;
}

export default App;
