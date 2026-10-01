import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Stethoscope, User, LogOut, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const isDoctor = user.role === 'doctor';
  const isAdmin = user.role === 'admin';

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Brand */}
        <div
          className="flex items-center space-x-3 cursor-pointer"
          onClick={() => navigate(isAdmin ? '/admin' : isDoctor ? '/doctor' : '/patient')}
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Heart className="w-5 h-5 text-white animate-heartbeat fill-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-tight text-white">
                Cardio<span className="text-cyan-400">Track</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                {isAdmin ? 'Admin Console' : 'Tele-Surg'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {isAdmin ? 'Clinical Telemetry & Session Operations' : 'Post-Op Cardiac Monitoring System'}
            </p>
          </div>
        </div>

        {/* User Info + Logout */}
        <div className="flex items-center space-x-3">

          {/* Portal Badge */}
          <div className={`hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border ${
            isAdmin
              ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
              : isDoctor
              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
              : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
          }`}>
            {isAdmin
              ? <><ShieldCheck className="w-3.5 h-3.5" /><span>Admin Console</span></>
              : isDoctor
              ? <><Stethoscope className="w-3.5 h-3.5" /><span>Doctor Portal</span></>
              : <><User className="w-3.5 h-3.5" /><span>Patient Portal</span></>
            }
          </div>

          {/* Name + role subtitle */}
          <div className="hidden md:flex flex-col text-right">
            <span className="text-sm font-semibold text-slate-200">{user.name}</span>
            <span className="text-[11px] text-slate-400 font-mono">
              {isAdmin ? 'System Superuser' : isDoctor ? (user.title || 'Cardiac Physician') : `Phone: ${user.phone}`}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-300 hover:text-white bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
