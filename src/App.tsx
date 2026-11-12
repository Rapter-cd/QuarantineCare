import React, { useState } from 'react';
import { useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { LoginScreen } from './components/auth/LoginScreen';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { NurseDashboard } from './components/dashboard/NurseDashboard';
import { DoctorDashboard } from './components/dashboard/DoctorDashboard';
import { PatientList } from './components/patients/PatientList';
import { DischargeManagement } from './components/patients/DischargeManagement';
import { AnalyticsReports } from './components/analytics/AnalyticsReports';
import { BedOccupancyGrid } from './components/common/BedOccupancyGrid';
import { PatientDetailsModal } from './components/patients/PatientDetailsModal';
import { AddPatientModal } from './components/patients/AddPatientModal';
import { Patient } from './types';
import { Menu, HeartPulse, Stethoscope, Building2, ShieldCheck, Thermometer, UserPlus } from 'lucide-react';

export const AppContent: React.FC = () => {
  const { currentUser, switchRole } = useApp();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [selectedEmptyBed, setSelectedEmptyBed] = useState<number | undefined>(undefined);

  if (!currentUser) {
    return <LoginScreen />;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        if (currentUser.role === 'admin') {
          return <AdminDashboard onNavigateToTab={(tab) => setCurrentTab(tab)} />;
        } else if (currentUser.role === 'doctor') {
          return <DoctorDashboard />;
        } else {
          return <NurseDashboard />;
        }
      case 'patients':
        return <PatientList />;
      case 'ward_map':
        return (
          <div className="space-y-6 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  74-Bed Quarantine Ward Map & Room Control
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time bed layout, occupancy status, and triage classification across all isolation rooms
                </p>
              </div>

              {currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    setSelectedEmptyBed(undefined);
                    setShowAddPatientModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  Admit Patient to Room
                </button>
              )}
            </div>

            <BedOccupancyGrid
              onSelectPatient={(p) => setSelectedPatientForDetails(p)}
              onSelectEmptyBed={(roomNum) => {
                setSelectedEmptyBed(roomNum);
                setShowAddPatientModal(true);
              }}
            />
          </div>
        );
      case 'record_temp':
        return <NurseDashboard />;
      case 'doctor_rounds':
        return <DoctorDashboard />;
      case 'discharge':
        return <DischargeManagement />;
      case 'analytics':
        return <AnalyticsReports />;
      default:
        return <AdminDashboard onNavigateToTab={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      {/* Mobile Sub-header with hamburger and quick role pills */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick mobile role switcher */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => switchRole('nurse')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold ${
              currentUser.role === 'nurse'
                ? 'bg-teal-100 text-teal-800'
                : 'text-slate-500'
            }`}
          >
            Nurse
          </button>
          <button
            onClick={() => switchRole('doctor')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold ${
              currentUser.role === 'doctor'
                ? 'bg-blue-100 text-blue-800'
                : 'text-slate-500'
            }`}
          >
            Doctor
          </button>
          <button
            onClick={() => switchRole('admin')}
            className={`px-2 py-1 rounded-md text-[11px] font-bold ${
              currentUser.role === 'admin'
                ? 'bg-purple-100 text-purple-800'
                : 'text-slate-500'
            }`}
          >
            Admin
          </button>
        </div>
      </div>

      <div className="flex-1 flex w-full">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto w-full">
          {renderTabContent()}
        </main>
      </div>

      {/* Patient Details Modal */}
      {selectedPatientForDetails && (
        <PatientDetailsModal
          patient={selectedPatientForDetails}
          onClose={() => setSelectedPatientForDetails(null)}
        />
      )}

      {/* Add Patient Modal */}
      {showAddPatientModal && (
        <AddPatientModal
          initialRoomNumber={selectedEmptyBed}
          onClose={() => {
            setShowAddPatientModal(false);
            setSelectedEmptyBed(undefined);
          }}
        />
      )}
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
