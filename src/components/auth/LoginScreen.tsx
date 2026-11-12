import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Lock,
  Mail,
  HeartPulse,
  Stethoscope,
  Building2,
  ArrowRight,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { UserRole } from '../../types';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();

  const [email, setEmail] = useState('nurse@quarantinecare.com');
  const [password, setPassword] = useState('demo123');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Please provide an email.');
      return;
    }
    const success = login(email);
    if (!success) {
      setError('Authentication failed. Please use one of the demo accounts.');
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    if (role === 'nurse') {
      setEmail('nurse@quarantinecare.com');
      login('nurse@quarantinecare.com', 'nurse');
    } else if (role === 'doctor') {
      setEmail('doctor@quarantinecare.com');
      login('doctor@quarantinecare.com', 'doctor');
    } else {
      setEmail('admin@quarantinecare.com');
      login('admin@quarantinecare.com', 'admin');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Logo and Brand */}
        <div className="inline-flex h-16 w-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-teal-400 items-center justify-center text-white shadow-xl shadow-teal-500/30 mb-4 animate-in fade-in zoom-in-90">
          <ShieldAlert className="w-9 h-9 stroke-[2.2]" />
        </div>
        <h1 className="text-3xl font-black tracking-tight text-white">
          Quarantine<span className="text-teal-400">Care</span>
        </h1>
        <p className="mt-2 text-xs text-slate-400 max-w-sm mx-auto">
          Hospital Virus Quarantine & Inpatient Treatment Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl py-8 px-6 sm:px-10 shadow-2xl rounded-3xl">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center font-medium">
              {error}
            </div>
          )}

          {/* Direct 1-Click Role Selection Demo Buttons */}
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-teal-400 mb-2.5 text-center">
              One-Click Evaluator Demo Sign-In
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('nurse')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 transition-all hover:scale-105 active:scale-95 group text-center"
              >
                <HeartPulse className="w-5 h-5 mb-1 text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Nurse</span>
                <span className="text-[9px] text-teal-300/70">Vitals & Rounds</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('doctor')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition-all hover:scale-105 active:scale-95 group text-center"
              >
                <Stethoscope className="w-5 h-5 mb-1 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Doctor</span>
                <span className="text-[9px] text-blue-300/70">Clinical Rounds</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-all hover:scale-105 active:scale-95 group text-center"
              >
                <Building2 className="w-5 h-5 mb-1 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold">Admin</span>
                <span className="text-[9px] text-purple-300/70">Beds & Analytics</span>
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-800 px-3 text-slate-400 font-bold">
                Or Sign In With Password
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="nurse@quarantinecare.com"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-xs text-white bg-slate-900/80 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="••••••••"
                />
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors shadow-lg shadow-teal-600/30 mt-2"
            >
              Sign In to QuarantineCare <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Credentials Info Box */}
          <div className="mt-6 p-3 bg-slate-900/60 rounded-xl border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Preset Credentials:</span>
            <div>&bull; Nurse: <strong className="text-teal-300">nurse@quarantinecare.com</strong> (demo123)</div>
            <div>&bull; Doctor: <strong className="text-blue-300">doctor@quarantinecare.com</strong> (demo123)</div>
            <div>&bull; Admin: <strong className="text-purple-300">admin@quarantinecare.com</strong> (demo123)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
