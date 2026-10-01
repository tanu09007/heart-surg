import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Heart, Stethoscope, User, Phone,
  ArrowRight, KeyRound, CheckCircle2,
  RefreshCw, MessageSquare, Lock, ShieldCheck, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { requestOtp, verifyOtpAndLogin, loginAdmin, user } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');

  // Admin login states
  const [adminUsername, setAdminUsername] = useState('admin@cardiotrack.com');
  const [adminPassword, setAdminPassword] = useState('admin123');

  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [currentOtp, setCurrentOtp] = useState(null);
  const [resendTimer, setResendTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);

  const otpInputsRef = useRef([]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate(user.role === 'doctor' ? '/doctor' : '/patient');
      }
    }
  }, [user, navigate]);

  // Resend countdown
  useEffect(() => {
    let interval = null;
    if (otpStep && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, resendTimer]);

  const handleRequestOtp = (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Please enter your full name'); return; }
    if (!phoneNumber.trim() || phoneNumber.length < 7) { toast.error('Please enter a valid phone number'); return; }

    setIsLoading(true);
    setTimeout(() => {
      const code = requestOtp();
      setCurrentOtp(code);
      setOtpStep(true);
      setResendTimer(60);
      setIsLoading(false);

      // Show realistic SMS-style toast
      toast.custom(
        (t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-sm w-full bg-slate-900 border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 rounded-2xl p-4 text-white`}>
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">CardioTrack SMS Gateway</span>
                  <span className="text-[10px] text-slate-500">Just now</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">Your verification code:</p>
                <div className="flex items-center space-x-3 mt-2">
                  <span className="text-2xl font-mono font-extrabold tracking-widest text-cyan-300 bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-700/50">
                    {code}
                  </span>
                  <button
                    type="button"
                    onClick={() => { fillOtp(code); toast.dismiss(t.id); }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 mt-2">Valid for 5 minutes. Do not share.</p>
              </div>
            </div>
          </div>
        ),
        { duration: 8000 }
      );

      setTimeout(() => { if (otpInputsRef.current[0]) otpInputsRef.current[0].focus(); }, 100);
    }, 500);
  };

  const fillOtp = (code) => {
    const digits = code.split('').slice(0, 6);
    setOtpDigits(digits);
    if (otpInputsRef.current[5]) otpInputsRef.current[5].focus();
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = Array(6).fill('').map((_, i) => pasted[i] || '');
        setOtpDigits(newDigits);
        const next = Math.min(pasted.length, 5);
        if (otpInputsRef.current[next]) otpInputsRef.current[next].focus();
        return;
      }
    }
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = digit;
    setOtpDigits(newDigits);
    if (digit && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 6) { toast.error('Enter the complete 6-digit OTP'); return; }

    setIsLoading(true);
    try {
      const fullPhone = `${countryCode}${phoneNumber}`;
      const loggedUser = verifyOtpAndLogin({ name, phone: fullPhone, role, enteredOtp });
      toast.success(`Welcome, ${loggedUser.name}!`);
      navigate(role === 'doctor' ? '/doctor' : '/patient');
    } catch (err) {
      toast.error(err.message || 'OTP Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e?.preventDefault();
    setIsLoading(true);
    try {
      const admin = loginAdmin({ username: adminUsername, password: adminPassword });
      toast.success(`Welcome, ${admin.name}! Admin Telemetry Console active.`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Admin authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAdminDemo = () => {
    setAdminUsername('admin@cardiotrack.com');
    setAdminPassword('admin123');
    setIsLoading(true);
    setTimeout(() => {
      try {
        const admin = loginAdmin({ username: 'admin@cardiotrack.com', password: 'admin123' });
        toast.success(`Welcome, ${admin.name}! Admin session initialized.`);
        navigate('/admin');
      } catch (err) {
        toast.error(err.message || 'Admin login failed');
      } finally {
        setIsLoading(false);
      }
    }, 300);
  };

  const accentGrad = role === 'doctor'
    ? 'from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/25'
    : role === 'admin'
    ? 'from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/25'
    : 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-cyan-600/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] rounded-full" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/25 mb-3">
            <Heart className="w-8 h-8 text-white fill-white animate-heartbeat" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Cardio<span className="text-cyan-400">Track</span> Telemedicine
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Post-Operative Cardiac Tele-Care & Surgical Monitoring Portal
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 space-y-5">

          {/* Role Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Sign In Portal
            </label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setRole('patient'); setOtpStep(false); }}
                className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'patient'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => { setRole('doctor'); setOtpStep(false); }}
                className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'doctor'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => { setRole('admin'); setOtpStep(false); }}
                className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  role === 'admin'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Admin Form or Doctor/Patient OTP Form */}
          {role === 'admin' ? (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start space-x-3 text-xs text-indigo-200">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-white text-xs">System Administration & Telemetry Console</span>
                  <p className="text-[11px] text-indigo-300/80 mt-0.5">
                    Real-time monitoring of logged-in doctors and patients, active telemedicine sessions, and clinical audits.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin ID / Email
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder="admin@cardiotrack.com"
                    value={adminUsername}
                    onChange={(e) => setAdminUsername(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Security Passcode
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Default demo passcode: <span className="font-mono text-indigo-300">admin123</span></p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>{isLoading ? 'Verifying Credentials…' : 'Sign In as System Admin'}</span>
              </button>

              <button
                type="button"
                onClick={handleQuickAdminDemo}
                disabled={isLoading}
                className="w-full py-2.5 px-3 rounded-xl font-semibold text-xs text-indigo-300 hover:text-white bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-700/50 transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>⚡ 1-Click Admin Demo Login</span>
              </button>
            </form>
          ) : !otpStep ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  {role === 'doctor' ? "Doctor's Full Name" : "Patient's Full Name"}
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    required
                    placeholder={role === 'doctor' ? 'Dr. Sarah Jenkins' : 'John Doe'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm focus:outline-none focus:border-cyan-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="flex space-x-2">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-2.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-cyan-500"
                  >
                    <option value="+91">+91 (IN)</option>
                    <option value="+1">+1 (US)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+61">+61 (AU)</option>
                  </select>
                  <div className="relative flex-1">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      type="tel"
                      required
                      placeholder="9876543210"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-cyan-500 transition"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {role === 'patient'
                    ? 'First-time users will have a new profile created automatically.'
                    : 'First-time doctors will have a new physician profile created.'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-lg bg-gradient-to-r transition-all cursor-pointer ${accentGrad}`}
              >
                <span>{isLoading ? 'Generating OTP...' : 'Send Verification OTP'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* STEP 2 – Enter OTP */
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center">
                <div className="inline-flex p-2.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-white">Enter 6-Digit OTP</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Code sent to <span className="font-mono text-cyan-300">{countryCode}{phoneNumber}</span>
                </p>
              </div>

              {/* OTP digit inputs */}
              <div className="flex justify-center space-x-2 sm:space-x-3 py-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputsRef.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-xl font-bold text-white bg-slate-950 border border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition"
                  />
                ))}
              </div>

              {/* Live OTP display + auto-fill */}
              {currentOtp && (
                <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-between text-xs">
                  <span className="text-slate-300">
                    Active Code: <strong className="font-mono text-cyan-300 tracking-widest text-sm">{currentOtp}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => fillOtp(currentOtp)}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline underline-offset-2"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center space-x-2 shadow-lg bg-gradient-to-r transition-all cursor-pointer ${accentGrad}`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isLoading ? 'Verifying...' : `Sign In as ${role === 'doctor' ? 'Doctor' : 'Patient'}`}</span>
              </button>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800">
                <button type="button" onClick={() => setOtpStep(false)} className="hover:text-slate-200 cursor-pointer">
                  ← Edit Number
                </button>
                {resendTimer > 0 ? (
                  <span>Resend in {resendTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestOtp}
                    className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>
            </form>
          )}

          {/* Seed account hints for testing */}
          <div className="mt-1 pt-4 border-t border-slate-800/80">
            <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2 text-center">Existing test accounts</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] text-slate-400">
              <div
                onClick={() => { setRole('doctor'); setName('Dr. Sarah Jenkins'); setPhoneNumber('9019283100'); setOtpStep(false); }}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer"
              >
                <div className="text-cyan-400 font-semibold mb-0.5 flex items-center justify-between">
                  <span>Doctor</span>
                  <span className="text-[9px] text-slate-500">Chief Surgeon</span>
                </div>
                <div className="text-white font-medium">Dr. Sarah Jenkins</div>
                <div className="font-mono text-slate-500">9019283100</div>
              </div>

              <div
                onClick={() => { setRole('patient'); setName('John Doe'); setPhoneNumber('9876543210'); setOtpStep(false); }}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition cursor-pointer"
              >
                <div className="text-emerald-400 font-semibold mb-0.5 flex items-center justify-between">
                  <span>Patient</span>
                  <span className="text-[9px] text-slate-500">Post-CABG</span>
                </div>
                <div className="text-white font-medium">John Doe</div>
                <div className="font-mono text-slate-500">9876543210</div>
              </div>

              <div
                onClick={() => { setRole('admin'); setAdminUsername('admin@cardiotrack.com'); setAdminPassword('admin123'); }}
                className="p-2 rounded-lg bg-slate-950 border border-indigo-800/60 hover:border-indigo-500/60 transition cursor-pointer col-span-2 sm:col-span-1"
              >
                <div className="text-indigo-400 font-semibold mb-0.5 flex items-center justify-between">
                  <span>Administrator</span>
                  <span className="text-[9px] text-indigo-400">Full Access</span>
                </div>
                <div className="text-white font-medium">admin@cardiotrack.com</div>
                <div className="font-mono text-indigo-300">Pass: admin123</div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-4 text-center text-xs text-slate-500 flex items-center justify-center space-x-1.5">
          <Lock className="w-3.5 h-3.5 text-cyan-500" />
          <span>HIPAA & End-to-End Encrypted Telemedicine Session</span>
        </div>
      </div>
    </div>
  );
}
