import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RegisterPlayer from './pages/RegisterPlayer';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeamList from './pages/TeamList';
import PlayerList from './pages/PlayerList';
import AddPlayer from './pages/AddPlayer';
import MatchControl from './pages/MatchControl';
import GameCenter from './pages/GameCenter';
import './index.css';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<RegisterPlayer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/teams/list" element={<TeamList />} />
        <Route path="/players/list" element={<PlayerList />} />
        <Route path="/players/new" element={<AddPlayer />} />
        <Route path="/admin/score-control/:id" element={<MatchControl />} />
        <Route path="/game-center/:id" element={<GameCenter />} />
      </Routes>
    </Router>
  );
};

export default App;
