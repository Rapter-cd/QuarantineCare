import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  HeartPulse,
  Thermometer,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Stethoscope,
  Bed,
  Plus,
  Eye,
  Search,
  Filter,
} from 'lucide-react';
import { RecordTemperatureModal } from '../patients/RecordTemperatureModal';
import { PatientDetailsModal } from '../patients/PatientDetailsModal';

export const NurseDashboard: React.FC = () => {
  const { activePatients, evaluations, feverThreshold, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientForTemp, setSelectedPatientForTemp] = useState<Patient | null>(null);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);

  // Categorize active patients
  const completedToday = activePatients.filter((p) => evaluations[p.id]?.hasRecordedToday);
  const pendingToday = activePatients.filter((p) => !evaluations[p.id]?.hasRecordedToday);
  const overdueTemps = activePatients.filter((p) => evaluations[p.id]?.isOverdueTemp);
  const awaitingDoctor = activePatients.filter(
    (p) => evaluations[p.id]?.hasRecordedToday && !evaluations[p.id]?.hasDoctorVisitedToday
  );

  const displayedPatients = (
    activeTab === 'pending'
      ? pendingToday
      : activeTab === 'completed'
      ? completedToday
      : activePatients
  ).filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(term) ||
      p.patientId.toLowerCase().includes(term) ||
      String(p.roomNumber).includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-emerald-800 rounded-3xl p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-teal-200 border border-white/20 mb-2.5">
              <HeartPulse className="w-4 h-4 text-teal-300" /> Nurse Station &bull; Daily Triage Roster
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Hello, {currentUser?.name || 'Nurse Clara'}
            </h1>
            <p className="text-sm text-teal-100 font-medium mt-1.5 max-w-2xl leading-relaxed">
              Conducting morning thermometry rounds. Hospital protocol enforces one official reading per patient per day; readings are instantly relayed to attending physicians.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (pendingToday.length > 0) {
                  setSelectedPatientForTemp(pendingToday[0]);
                }
              }}
              disabled={pendingToday.length === 0}
              className="flex items-center gap-2 px-6 py-3.5 bg-white text-teal-800 hover:bg-teal-50 rounded-2xl text-sm font-black shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              <Thermometer className="w-5 h-5 text-teal-600" />
              {pendingToday.length > 0
                ? `Begin Rounds (${pendingToday.length} Pending)`
                : 'All Measurements Done!'}
            </button>
          </div>
        </div>
      </div>

      {/* 5 Operational Cards for Nurses */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Card 1: Active Patients */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Admitted Census
          </span>
          <div className="text-3xl font-black text-slate-900 mt-1.5">
            {activePatients.length}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">
            Active in Isolation Units
          </span>
        </div>

        {/* Card 2: Completed Today */}
        <div className="bg-white rounded-3xl border border-emerald-200 bg-emerald-50/25 p-5 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            Completed Today
          </span>
          <div className="text-3xl font-black text-emerald-800 mt-1.5">
            {completedToday.length}
          </div>
          <span className="text-xs text-emerald-700 font-bold mt-1 block flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Vitals Logged
          </span>
        </div>

        {/* Card 3: Pending Today */}
        <div className="bg-white rounded-3xl border border-amber-200 bg-amber-50/25 p-5 shadow-xs">
          <span className="text-xs font-bold text-amber-700 uppercase tracking-wider block">
            Pending Today
          </span>
          <div className="text-3xl font-black text-amber-800 mt-1.5">
            {pendingToday.length}
          </div>
          <span className="text-xs text-amber-700 font-bold mt-1 block flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-600" /> Requires Reading
          </span>
        </div>

        {/* Card 4: Overdue warning */}
        <div className="bg-white rounded-3xl border border-rose-200 bg-rose-50/25 p-5 shadow-xs">
          <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
            Overdue Readings
          </span>
          <div className="text-3xl font-black text-rose-800 mt-1.5">
            {overdueTemps.length}
          </div>
          <span className="text-xs text-rose-700 font-bold mt-1 block flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" /> Urgent Attention
          </span>
        </div>

        {/* Card 5: Awaiting Doctor Rounds */}
        <div className="bg-white rounded-3xl border border-blue-200 bg-blue-50/25 p-5 shadow-xs">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Awaiting Doctor
          </span>
          <div className="text-3xl font-black text-blue-800 mt-1.5">
            {awaitingDoctor.length}
          </div>
          <span className="text-xs text-blue-700 font-bold mt-1 block flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-blue-600" /> Temp Recorded First
          </span>
        </div>
      </div>

      {/* Main Roster Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'pending'
                  ? 'bg-white text-amber-900 shadow-sm border border-amber-200/80 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending Measurement ({pendingToday.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'completed'
                  ? 'bg-white text-emerald-900 shadow-sm border border-emerald-200/80 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Completed Today ({completedToday.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200 scale-[1.01]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Active Patients ({activePatients.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search room, patient, or ID..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-800 font-extrabold uppercase text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-5">Room</th>
                <th className="py-4 px-5">Patient Name & ID</th>
                <th className="py-4 px-5">Age / Gender</th>
                <th className="py-4 px-5">Last Reading</th>
                <th className="py-4 px-5">Today's Temperature</th>
                <th className="py-4 px-5">Doctor Visit Status</th>
                <th className="py-4 px-5">Fever-Free Streak</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {displayedPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No patients in this category.
                  </td>
                </tr>
              ) : (
                displayedPatients.map((patient) => {
                  const ev = evaluations[patient.id];
                  const hasRecorded = ev?.hasRecordedToday;
                  const latestTemp = ev?.latestTemperature?.temperature;
                  const hasFever = (latestTemp || 0) >= feverThreshold;

                  return (
                    <tr key={patient.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-black text-sm text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 flex items-center gap-1.5 w-max">
                          <Bed className="w-4 h-4 text-teal-600" />
                          #{patient.roomNumber}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-extrabold text-base text-slate-900 block leading-tight">{patient.name}</span>
                        <span className="text-xs text-slate-500 font-mono font-semibold mt-0.5 block">
                          {patient.patientId}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-slate-700 font-medium text-sm">
                        {patient.age} yrs &bull; {patient.gender}
                      </td>

                      <td className="py-4 px-5 font-mono font-black text-base">
                        {latestTemp ? (
                          <span className={hasFever ? 'text-rose-600' : 'text-teal-700'}>
                            {latestTemp.toFixed(1)}°C
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal text-sm">None</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        {hasRecorded ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Recorded ({ev?.todayRecord?.temperature}°C)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            Pending Today
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        {ev?.hasDoctorVisitedToday ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                            Visited Today
                          </span>
                        ) : hasRecorded ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Awaiting Doctor
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium italic">Awaiting Temp First</span>
                        )}
                      </td>

                      <td className="py-4 px-5">
                        <span className="font-extrabold text-sm text-slate-900">
                          {ev?.feverFreeStreak || 0} / 3 days
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setSelectedPatientForDetails(patient)}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                            title="View Patient Clinical File"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setSelectedPatientForTemp(patient)}
                            disabled={hasRecorded}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl transition-all shadow-xs ${
                              hasRecorded
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/20 hover:scale-[1.02]'
                            }`}
                          >
                            <Thermometer className="w-4 h-4" />
                            {hasRecorded ? 'Recorded' : 'Record Temp'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {selectedPatientForTemp && (
        <RecordTemperatureModal
          patient={selectedPatientForTemp}
          onClose={() => setSelectedPatientForTemp(null)}
        />
      )}

      {selectedPatientForDetails && (
        <PatientDetailsModal
          patient={selectedPatientForDetails}
          onClose={() => setSelectedPatientForDetails(null)}
        />
      )}
    </div>
  );
};
