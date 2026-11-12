import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Thermometer,
  RotateCcw,
  LogOut,
  Stethoscope,
  HeartPulse,
  Sliders,
  Check,
} from 'lucide-react';
import { NotificationDropdown } from './NotificationDropdown';
import { UserRole } from '../../types';

export const Header: React.FC = () => {
  const {
    currentUser,
    switchRole,
    logout,
    resetDemoData,
    feverThreshold,
    setFeverThreshold,
    activePatients,
    totalCapacity,
  } = useApp();

  const [showThresholdModal, setShowThresholdModal] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(feverThreshold);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
  };

  const saveThreshold = () => {
    setFeverThreshold(tempThreshold);
    setShowThresholdModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 shadow-xs backdrop-blur-sm bg-white/98">
        <div className="w-full px-5 sm:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Facility Brand */}
            <div className="flex items-center space-x-3.5">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
                <ShieldAlert className="w-7 h-7 stroke-[2.3]" />
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <span className="text-2xl font-black tracking-tight text-slate-900">
                    Quarantine<span className="text-teal-600">Care</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-extrabold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200">
                    Isolation Unit
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium hidden md:block mt-0.5">
                  Capacity: <strong className="text-slate-800">{activePatients.length}/{totalCapacity} Beds</strong> Occupied ({((activePatients.length / totalCapacity) * 100).toFixed(0)}%)
                </p>
              </div>
            </div>

            {/* Middle: Role Quick-Switcher */}
            <div className="hidden lg:flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shadow-inner">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 px-3">Role:</span>
              <button
                onClick={() => handleRoleChange('nurse')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  currentUser?.role === 'nurse'
                    ? 'bg-white text-teal-800 shadow-sm border border-teal-200/80 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <HeartPulse className="w-4 h-4 text-teal-600" />
                Nurse
              </button>
              <button
                onClick={() => handleRoleChange('doctor')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  currentUser?.role === 'doctor'
                    ? 'bg-white text-blue-800 shadow-sm border border-blue-200/80 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-blue-600" />
                Doctor
              </button>
              <button
                onClick={() => handleRoleChange('admin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  currentUser?.role === 'admin'
                    ? 'bg-white text-purple-800 shadow-sm border border-purple-200/80 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                Admin
              </button>
            </div>

            {/* Right side items */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Configurable Fever Threshold Button */}
              <button
                onClick={() => {
                  setTempThreshold(feverThreshold);
                  setShowThresholdModal(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-colors"
                title="Configurable Fever Threshold (Standard: 38.0°C)"
              >
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>Threshold: <strong className="text-slate-900">{feverThreshold}°C</strong></span>
                <Sliders className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </button>

              {/* Reset Demo Data Button */}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="p-2.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="Reset Clean Demo Data"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Notifications Dropdown */}
              <NotificationDropdown />

              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-3 border-l border-slate-200">
                <div className="relative">
                  <img
                    src={
                      currentUser?.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
                    }
                    alt={currentUser?.name}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-teal-500/30"
                  />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white ${
                      currentUser?.role === 'nurse'
                        ? 'bg-teal-500'
                        : currentUser?.role === 'doctor'
                        ? 'bg-blue-500'
                        : 'bg-purple-500'
                    }`}
                  />
                </div>
                <div className="hidden xl:block text-left">
                  <div className="text-sm font-bold text-slate-900 truncate max-w-[160px]">
                    {currentUser?.name}
                  </div>
                  <div className="text-xs text-slate-500 uppercase tracking-wider font-bold">
                    {currentUser?.role}
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors ml-1"
                  title="Sign Out / Switch Demo"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Fever Threshold Modal */}
      {showThresholdModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2 text-teal-600 mb-2">
              <Thermometer className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-slate-900 text-base">Fever Threshold Setting</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Temperatures at or above this threshold mark the patient as having an active fever and reset their 3-day fever-free discharge streak. (Standard protocol: 38.0°C).
            </p>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-700">
                Threshold Value (°C):
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="number"
                  step="0.1"
                  min="36.5"
                  max="40.0"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(parseFloat(e.target.value) || 38.0)}
                  className="w-24 px-3 py-2 text-base font-bold text-center border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <span className="text-xs text-slate-500">
                  Recommended: <strong>38.0°C</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowThresholdModal(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveThreshold}
                className="flex items-center gap-1 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                Apply Setting
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Demo Data Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-2 text-amber-600 mb-2">
              <RotateCcw className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">Reset Demo Data?</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              This will restore the complete reference dataset with 12 sample patients across varying stages (active fevers, recovering patients, 3-day fever-free discharge eligible patients, and historical benchmarks).
            </p>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetDemoData();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-sm"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
