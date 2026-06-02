import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
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
import PortalMatchStats from './pages/PortalMatchStats';
import AdminLeads from './pages/AdminLeads';
import './index.css';

const App = () => {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/registro" element={<RegisterPlayer />} />
        <Route path="/login" element={<Login />} />
        <Route path="/game-center/:id" element={<GameCenter />} />

        {/* Admin Redirects */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Admin & Coach Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><Dashboard /></ProtectedRoute>} />
        <Route path="/teams/list" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><TeamList /></ProtectedRoute>} />
        <Route path="/players/list" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><PlayerList /></ProtectedRoute>} />
        <Route path="/players/new" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><AddPlayer /></ProtectedRoute>} />
        <Route path="/players/:id" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><PlayerDetail /></ProtectedRoute>} />
        <Route path="/admin/score-control/:id" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><MatchControl /></ProtectedRoute>} />
        <Route path="/admin/announcements" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><AdminAnnouncements /></ProtectedRoute>} />
        <Route path="/estadisticas" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><StatsCenter /></ProtectedRoute>} />
        <Route path="/admin/calendar" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><AdminCalendar /></ProtectedRoute>} />
        <Route path="/admin/matches/:id/stats" element={<ProtectedRoute allowedRoles={['admin', 'coach']}><AdminStats /></ProtectedRoute>} />

        {/* Admin Only Routes */}
        <Route path="/admin/payments" element={<ProtectedRoute allowedRoles={['admin']}><Payments /></ProtectedRoute>} />
        <Route path="/admin/parents/new" element={<ProtectedRoute allowedRoles={['admin']}><AddParent /></ProtectedRoute>} />
        <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin']}><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/leads" element={<ProtectedRoute allowedRoles={['admin']}><AdminLeads /></ProtectedRoute>} />

        {/* Portal (Parents & Players) Routes */}
        <Route path="/portal" element={<ProtectedRoute allowedRoles={['parent', 'player']}><PortalDashboard /></ProtectedRoute>} />
        <Route path="/portal/payments" element={<ProtectedRoute allowedRoles={['parent', 'player']}><PortalPayments /></ProtectedRoute>} />
        <Route path="/portal/payments/:id/report" element={<ProtectedRoute allowedRoles={['parent', 'player']}><ReportPayment /></ProtectedRoute>} />
        <Route path="/portal/avisos" element={<ProtectedRoute allowedRoles={['parent', 'player']}><Avisos /></ProtectedRoute>} />
        <Route path="/portal/agenda" element={<ProtectedRoute allowedRoles={['parent', 'player']}><PortalCalendar /></ProtectedRoute>} />
        <Route path="/portal/perfil" element={<ProtectedRoute allowedRoles={['parent', 'player']}><PortalFamilies /></ProtectedRoute>} />

        {/* Shared Authenticated Routes */}
        <Route path="/portal/player/:id/playcard" element={<ProtectedRoute><PortalPlayerCard /></ProtectedRoute>} />
        <Route path="/portal/match/:id/stats" element={<ProtectedRoute><PortalMatchStats /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
};

export default App;
