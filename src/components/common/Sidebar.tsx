import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Bed,
  Thermometer,
  Stethoscope,
  ShieldCheck,
  Activity,
  HeartPulse,
  UserPlus,
  HelpCircle,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { currentUser, activePatients, evaluations, totalCapacity } = useApp();

  // Counts
  const pendingTempsCount = activePatients.filter(
    (p) => !evaluations[p.id]?.hasRecordedToday
  ).length;

  const awaitingDocCount = activePatients.filter(
    (p) => evaluations[p.id]?.hasRecordedToday && !evaluations[p.id]?.hasDoctorVisitedToday
  ).length;

  const dischargeEligibleCount = activePatients.filter(
    (p) => evaluations[p.id]?.isDischargeEligible
  ).length;

  const navItems = [
    {
      id: 'dashboard',
      label: `${currentUser?.role === 'admin' ? 'Admin' : currentUser?.role === 'doctor' ? 'Doctor' : 'Nurse'} Dashboard`,
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'patients',
      label: 'Patient Registry',
      icon: Users,
      badge: `${activePatients.length} Active`,
      badgeColor: 'bg-teal-100 text-teal-800',
    },
    {
      id: 'ward_map',
      label: '74-Bed Quarantine Ward',
      icon: Bed,
      badge: `${activePatients.length}/${totalCapacity}`,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'record_temp',
      label: 'Record Temperature',
      icon: Thermometer,
      badge: pendingTempsCount > 0 ? `${pendingTempsCount} Pending` : 'All Done',
      badgeColor: pendingTempsCount > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-emerald-100 text-emerald-800',
    },
    {
      id: 'doctor_rounds',
      label: 'Doctor Rounds Queue',
      icon: Stethoscope,
      badge: awaitingDocCount > 0 ? `${awaitingDocCount} Ready` : null,
      badgeColor: 'bg-blue-100 text-blue-800 font-bold',
    },
    {
      id: 'discharge',
      label: 'Discharge Center',
      icon: ShieldCheck,
      badge: dischargeEligibleCount > 0 ? `${dischargeEligibleCount} Eligible` : null,
      badgeColor: 'bg-purple-100 text-purple-800 font-bold animate-pulse',
    },
    {
      id: 'analytics',
      label: 'Analytics & Benchmarks',
      icon: Activity,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-20 left-0 z-40 h-[calc(100vh-5rem)] w-72 bg-white border-r border-slate-200/90 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 space-y-1.5 overflow-y-auto">
          <div className="px-3.5 py-2 text-xs font-black uppercase tracking-wider text-slate-400">
            Quarantine Management
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-900 border border-teal-200/90 shadow-sm scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      isActive ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Facility Info Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm">
            <div className="flex items-center justify-between font-black text-slate-900 mb-1.5">
              <span>Ward Capacity</span>
              <span className="text-teal-700 font-extrabold">{activePatients.length} / {totalCapacity}</span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-2">
              <div
                className="bg-teal-600 h-full rounded-full transition-all"
                style={{
                  width: `${((activePatients.length / totalCapacity) * 100).toFixed(0)}%`,
                }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Occupied: <strong className="text-slate-800">{activePatients.length}</strong></span>
              <span>Available: <strong className="text-emerald-700">{totalCapacity - activePatients.length}</strong></span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
