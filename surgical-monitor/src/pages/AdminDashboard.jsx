import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import Navbar from '../components/Navbar';
import {
  ShieldCheck, Users, Stethoscope, User, Activity,
  Clock, RefreshCw, Search, LogOut, CheckCircle2,
  AlertCircle, Smartphone, Monitor, Globe, Radio,
  Camera, ChevronRight, XCircle, Heart, FileText,
  Building2, Phone, Calendar, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'doctors' | 'patients' | 'audit'
  const [sessionsFilter, setSessionsFilter] = useState('all_active'); // 'all_active' | 'doctors' | 'patients' | 'all'
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Data states
  const [sessions, setSessions] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({
    activeDoctors: 0,
    activePatients: 0,
    totalDoctors: 0,
    totalPatients: 0,
    linkedPatients: 0,
    totalIncisionUploads: 0
  });

  // Load all telemetry
  const refreshData = () => {
    const allSessions = dataService.getAllSessions();
    const allDocs = dataService.getAllDoctors();
    const allPats = dataService.getAllPatients();
    const currentStats = dataService.getAdminStats();

    setSessions(allSessions);
    setDoctors(allDocs);
    setPatients(allPats);
    setStats(currentStats);
    setLastRefreshed(new Date());
  };

  // Initial load + periodic polling every 4 seconds for live telemetry
  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      refreshData();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Format relative time helper
  const formatTimeAgo = (isoString) => {
    if (!isoString) return '—';
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHrs = Math.floor(diffMin / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${Math.floor(diffHrs / 24)}d ago`;
  };

  // Terminate session handler
  const handleTerminateSession = (session) => {
    const res = dataService.terminateSession(session.id);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Session for ${session.name} terminated.`);
      refreshData();
    }
  };

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      // Status & role filter
      if (sessionsFilter === 'all_active' && s.status !== 'active') return false;
      if (sessionsFilter === 'doctors' && (s.status !== 'active' || s.role !== 'doctor')) return false;
      if (sessionsFilter === 'patients' && (s.status !== 'active' || s.role !== 'patient')) return false;

      // Text search
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        s.name?.toLowerCase().includes(q) ||
        s.phone?.includes(q) ||
        s.device?.toLowerCase().includes(q) ||
        s.browser?.toLowerCase().includes(q) ||
        s.ip?.toLowerCase().includes(q) ||
        s.role?.toLowerCase().includes(q)
      );
    });
  }, [sessions, sessionsFilter, searchQuery]);

  // Online status checker
  const isDoctorOnline = (doctorId) => {
    return sessions.some((s) => s.userId === doctorId && s.status === 'active');
  };

  const isPatientOnline = (patientId) => {
    return sessions.some((s) => s.userId === patientId && s.status === 'active');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500/30">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Top Header Banner ─────────────────────────────────────────── */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
            <div className="flex items-start space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 shrink-0">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center flex-wrap gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                    Clinical Operations & Telemetry Console
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>Live Telemetry</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Real-time monitoring of actively logged-in cardiac surgeons, attending physicians, and post-op patients.
                </p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <div className="text-right hidden sm:block">
                <span className="text-[10px] uppercase font-semibold text-slate-500 block">Telemetry Stream</span>
                <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Synced {formatTimeAgo(lastRefreshed)}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => { refreshData(); toast.success('Telemetry refreshed'); }}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-700 hover:border-indigo-400 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
                <span>Sync Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Metric KPI Cards ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">

          {/* Active Doctors */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-500/30 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Doctors Online</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500" />
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-cyan-300">{stats.activeDoctors}</span>
              <span className="text-xs text-slate-400">active now</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center space-x-1">
              <Stethoscope className="w-3 h-3 text-cyan-400" />
              <span>Surgeons & Physicians</span>
            </p>
          </div>

          {/* Active Patients */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 shadow-lg relative overflow-hidden group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Patients Online</span>
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-emerald-300">{stats.activePatients}</span>
              <span className="text-xs text-slate-400">active now</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center space-x-1">
              <User className="w-3 h-3 text-emerald-400" />
              <span>Post-Op Monitoring</span>
            </p>
          </div>

          {/* Total Registered Doctors */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Doctors</span>
              <Stethoscope className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-white">{stats.totalDoctors}</span>
              <span className="text-xs text-slate-400">registered</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">Cardiac Wing Specialists</p>
          </div>

          {/* Total Registered Patients */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Total Patients</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-white">{stats.totalPatients}</span>
              <span className="text-xs text-slate-400">registered</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">{stats.linkedPatients} linked to doctors</p>
          </div>

          {/* Incision Photos Uploaded */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400">Wound Photos</span>
              <Camera className="w-4 h-4 text-purple-400" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold font-mono text-purple-300">{stats.totalIncisionUploads}</span>
              <span className="text-xs text-slate-400">photos</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">Incision Healing Checks</p>
          </div>
        </div>

        {/* ── Main Navigation Tabs ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'sessions'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Live Active Sessions ({sessions.filter((s) => s.status === 'active').length})</span>
            </button>

            <button
              onClick={() => setActiveTab('doctors')}
              className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'doctors'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Doctors Directory ({doctors.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'patients'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Patients Directory ({patients.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('audit')}
              className={`hidden md:flex items-center space-x-2 py-2 px-4 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer ${
                activeTab === 'audit'
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Audit History ({sessions.length})</span>
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: LIVE ACTIVE SESSIONS                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'sessions' && (
          <div className="space-y-4">
            {/* Filter controls + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setSessionsFilter('all_active')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    sessionsFilter === 'all_active'
                      ? 'bg-indigo-500 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  🟢 All Active Online ({sessions.filter((s) => s.status === 'active').length})
                </button>

                <button
                  onClick={() => setSessionsFilter('doctors')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    sessionsFilter === 'doctors'
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  🩺 Doctors Online ({stats.activeDoctors})
                </button>

                <button
                  onClick={() => setSessionsFilter('patients')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    sessionsFilter === 'patients'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  👤 Patients Online ({stats.activePatients})
                </button>

                <button
                  onClick={() => setSessionsFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    sessionsFilter === 'all'
                      ? 'bg-slate-700 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  All (Including Logged Out)
                </button>
              </div>

              <div className="relative sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search user, phone, IP…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>

            {/* Sessions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSessions.map((sess) => {
                const isActive = sess.status === 'active';
                const isDoc = sess.role === 'doctor';
                const isAdmin = sess.role === 'admin';

                return (
                  <div
                    key={sess.id}
                    className={`rounded-2xl p-5 border transition shadow-xl relative overflow-hidden ${
                      isActive
                        ? isDoc
                          ? 'bg-slate-900/90 border-cyan-500/40 hover:border-cyan-400/80 shadow-cyan-500/5'
                          : isAdmin
                          ? 'bg-slate-900/90 border-indigo-500/40 hover:border-indigo-400/80'
                          : 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-400/80 shadow-emerald-500/5'
                        : 'bg-slate-900/40 border-slate-800/80 opacity-60'
                    }`}
                  >
                    {/* Status ribbon */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                      <div className="flex items-center space-x-2">
                        <span className="flex h-2.5 w-2.5 relative">
                          {isActive && (
                            <span
                              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                isDoc ? 'bg-cyan-400' : isAdmin ? 'bg-indigo-400' : 'bg-emerald-400'
                              }`}
                            />
                          )}
                          <span
                            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                              isActive
                                ? isDoc ? 'bg-cyan-500' : isAdmin ? 'bg-indigo-500' : 'bg-emerald-500'
                                : 'bg-slate-600'
                            }`}
                          />
                        </span>
                        <span
                          className={`text-xs font-bold uppercase tracking-wider font-mono ${
                            isActive
                              ? isDoc ? 'text-cyan-300' : isAdmin ? 'text-indigo-300' : 'text-emerald-300'
                              : 'text-slate-500'
                          }`}
                        >
                          {isActive ? 'ONLINE NOW' : sess.status === 'terminated' ? 'TERMINATED' : 'LOGGED OUT'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            isDoc
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : isAdmin
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {sess.role}
                        </span>

                        {isActive && !isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleTerminateSession(sess)}
                            className="px-2 py-0.5 rounded text-[10px] font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition cursor-pointer"
                            title="Force disconnect this user"
                          >
                            Disconnect
                          </button>
                        )}
                      </div>
                    </div>

                    {/* User profile & details */}
                    <div className="mt-3.5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-bold text-white flex items-center space-x-2">
                            <span>{sess.name}</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-0.5">{sess.title || sess.hospital}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 font-mono block">Logged In</span>
                          <span className="text-xs font-semibold text-slate-200 font-mono">
                            {formatTimeAgo(sess.loginAt)}
                          </span>
                        </div>
                      </div>

                      {/* Metadata grid */}
                      <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Phone / Contact</span>
                          <span className="font-mono text-slate-300 font-medium">{sess.phone || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Network IP</span>
                          <span className="font-mono text-cyan-300 font-medium truncate block">{sess.ip || '192.168.1.1'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Device Client</span>
                          <span className="text-slate-300 truncate block">{sess.device || 'Desktop Workstation'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block uppercase">Last Heartbeat</span>
                          <span className="font-mono text-emerald-400 font-medium">
                            {isActive ? formatTimeAgo(sess.lastHeartbeat) : 'Ended'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredSessions.length === 0 && (
                <div className="col-span-2 text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-sm">
                  No active sessions found matching your filter criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: DOCTORS DIRECTORY                                          */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'doctors' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((doc) => {
                const online = isDoctorOnline(doc.id);
                const docPatients = patients.filter((p) => p.doctorId === doc.id);

                return (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition shadow-xl space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0">
                          <Stethoscope className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{doc.name}</h4>
                          <p className="text-xs text-slate-400">{doc.title}</p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                          online
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span>{online ? 'Online' : 'Offline'}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between border-b border-slate-800/80 pb-1">
                        <span className="text-slate-500">Hospital:</span>
                        <span className="text-right text-slate-200">{doc.hospital}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-1">
                        <span className="text-slate-500">Specialty:</span>
                        <span className="text-right text-cyan-300 max-w-[200px] truncate">{doc.specialty}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-1">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-mono text-slate-300">{doc.phone}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500">Assigned Patients:</span>
                        <span className="font-bold font-mono text-cyan-400">{docPatients.length} patients</span>
                      </div>
                    </div>

                    {docPatients.length > 0 && (
                      <div className="pt-2 border-t border-slate-800/80">
                        <span className="text-[10px] uppercase font-semibold text-slate-500 block mb-1.5">Connected Patients</span>
                        <div className="flex flex-wrap gap-1.5">
                          {docPatients.map((p) => (
                            <span key={p.id} className="px-2 py-0.5 rounded-md text-[11px] bg-slate-950 border border-slate-800 text-slate-300">
                              {p.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: PATIENTS DIRECTORY                                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'patients' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((pat) => {
                const online = isPatientOnline(pat.id);
                const assignedDoc = doctors.find((d) => d.id === pat.doctorId);
                const incisionCount = pat.incisionPhotos?.length || 0;
                const latestVital = pat.vitalsHistory?.[0];

                return (
                  <div
                    key={pat.id}
                    className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 transition shadow-xl space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{pat.name}</h4>
                          <p className="text-xs text-slate-400">
                            {pat.gender ? `${pat.gender}, ${pat.age} yrs` : 'Post-Op Patient'}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center space-x-1 ${
                          online
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span>{online ? 'Online' : 'Offline'}</span>
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex justify-between border-b border-slate-800/80 pb-1">
                        <span className="text-slate-500">Procedure:</span>
                        <span className="text-right text-slate-200 font-medium max-w-[200px] truncate">{pat.surgeryType || '—'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-1">
                        <span className="text-slate-500">Post-Op Day:</span>
                        <span className="font-bold font-mono text-cyan-300">
                          {pat.postOpDay > 0 ? `Day ${pat.postOpDay}` : '—'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-1">
                        <span className="text-slate-500">Attending Doctor:</span>
                        <span className="text-right text-emerald-300 font-semibold">
                          {assignedDoc ? assignedDoc.name : 'Unassigned'}
                        </span>
                      </div>
                      <div className="flex justify-between border-b border-slate-800/80 pb-1">
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-mono text-slate-300">{pat.phone}</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-500">Wound Photos:</span>
                        <span className="font-bold font-mono text-purple-400">{incisionCount} uploads</span>
                      </div>
                    </div>

                    {/* Vitals preview */}
                    {latestVital && (
                      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Latest BP:</span>
                        <span className="font-mono font-bold text-cyan-300">{latestVital.systolic}/{latestVital.diastolic} mmHg</span>
                        <span className="text-slate-400 ml-2">HR:</span>
                        <span className="font-mono font-bold text-rose-400">{latestVital.heartRate} bpm</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB 4: AUDIT & LOGIN HISTORY                                      */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'audit' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Security & Clinical Session Audit Trail</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">{sessions.length} total records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-3 px-3">Session ID</th>
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Login Time</th>
                    <th className="py-3 px-3">Device / IP</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {sessions.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{s.id.slice(0, 12)}…</td>
                      <td className="py-3 px-3 font-bold text-white font-sans">{s.name}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            s.role === 'doctor'
                              ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                              : s.role === 'admin'
                              ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {s.role}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            s.status === 'active'
                              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                              : 'text-slate-500 bg-slate-800/50 border-slate-700'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-400 font-sans text-xs">
                        {new Date(s.loginAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-3 text-slate-400 text-xs">
                        {s.device} • <span className="text-cyan-400">{s.ip}</span>
                      </td>
                      <td className="py-3 px-3">
                        {s.status === 'active' && s.role !== 'admin' && (
                          <button
                            type="button"
                            onClick={() => handleTerminateSession(s)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-sans font-bold cursor-pointer"
                          >
                            Terminate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
