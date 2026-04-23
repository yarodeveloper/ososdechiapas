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
import PlayerDetail from './pages/PlayerDetail';
import Payments from './pages/Payments';
import AddParent from './pages/AddParent';
import PortalDashboard from './pages/PortalDashboard';
import PortalPayments from './pages/PortalPayments';
import ReportPayment from './pages/ReportPayment';
import AdminSettings from './pages/AdminSettings';
import AdminAnnouncements from './pages/AdminAnnouncements';
import Avisos from './pages/Avisos';
import StatsCenter from './pages/StatsCenter';
import MatchStatsCapture from './pages/MatchStatsCapture';
import AdminCategories from './pages/AdminCategories';
import AdminCalendar from './pages/AdminCalendar';
import AdminStats from './pages/AdminStats';
import PortalCalendar from './pages/PortalCalendar';
import PortalFamilies from './pages/PortalFamilies';
import PortalPlayerCard from './pages/PortalPlayerCard';
import { useEffect } from 'react';
import './index.css';

const App = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

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
        <Route path="/players/:id" element={<PlayerDetail />} />
        <Route path="/admin/payments" element={<Payments />} />
        <Route path="/admin/parents/new" element={<AddParent />} />
        <Route path="/portal" element={<PortalDashboard />} />
        <Route path="/portal/payments" element={<PortalPayments />} />
        <Route path="/portal/payments/:id/report" element={<ReportPayment />} />
        <Route path="/portal/avisos" element={<Avisos />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/admin/announcements" element={<AdminAnnouncements />} />
        <Route path="/estadisticas" element={<StatsCenter />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/calendar" element={<AdminCalendar />} />
        <Route path="/admin/matches/:id/stats" element={<AdminStats />} />
        <Route path="/portal/agenda" element={<PortalCalendar />} />
        <Route path="/portal/perfil" element={<PortalFamilies />} />
        <Route path="/portal/player/:id/playcard" element={<PortalPlayerCard />} />
      </Routes>
    </Router>
  );
};

export default App;
