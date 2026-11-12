import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, PatientStatus } from '../../types';
import {
  Search,
  Filter,
  UserPlus,
  Thermometer,
  Stethoscope,
  ShieldCheck,
  Bed,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';
import { PatientDetailsModal } from './PatientDetailsModal';
import { RecordTemperatureModal } from './RecordTemperatureModal';
import { CompleteDoctorVisitModal } from './CompleteDoctorVisitModal';
import { AddPatientModal } from './AddPatientModal';

export const PatientList: React.FC = () => {
  const {
    patients,
    evaluations,
    feverThreshold,
    currentUser,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | PatientStatus>('Admitted');
  const [quickFilter, setQuickFilter] = useState<
    'all' | 'needs_temp' | 'needs_doc' | 'discharge_eligible' | 'has_fever'
  >('all');
  const [roomSearch, setRoomSearch] = useState('');

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientForTemp, setPatientForTemp] = useState<Patient | null>(null);
  const [patientForVisit, setPatientForVisit] = useState<Patient | null>(null);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);

  // Filtered and searched patients
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const evaluation = evaluations[patient.id];

      // Status filter
      if (statusFilter !== 'All' && patient.status !== statusFilter) {
        return false;
      }

      // Room search
      if (roomSearch.trim()) {
        const roomNum = parseInt(roomSearch.trim(), 10);
        if (!isNaN(roomNum) && patient.roomNumber !== roomNum) {
          return false;
        }
      }

      // Quick filter
      if (quickFilter === 'needs_temp' && evaluation?.hasRecordedToday) return false;
      if (
        quickFilter === 'needs_doc' &&
        (!evaluation?.hasRecordedToday || evaluation?.hasDoctorVisitedToday)
      ) {
        return false;
      }
      if (quickFilter === 'discharge_eligible' && !evaluation?.isDischargeEligible) return false;
      if (
        quickFilter === 'has_fever' &&
        (evaluation?.latestTemperature?.temperature || 0) < feverThreshold
      ) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchesName = patient.name.toLowerCase().includes(term);
        const matchesId = patient.patientId.toLowerCase().includes(term);
        const matchesRoom = String(patient.roomNumber).includes(term);
        if (!matchesName && !matchesId && !matchesRoom) return false;
      }

      return true;
    });
  }, [patients, evaluations, statusFilter, quickFilter, searchTerm, roomSearch, feverThreshold]);

  return (
    <div className="space-y-5">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Patient Management & Census
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized monitoring of all quarantine beds, daily thermometry, and doctor rounds
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            onClick={() => setShowAddPatientModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            Register New Patient
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search box */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, patient ID (e.g. QC-2026)..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Room filter */}
          <div className="sm:col-span-3 relative">
            <Bed className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="number"
              min="1"
              max="74"
              value={roomSearch}
              onChange={(e) => setRoomSearch(e.target.value)}
              placeholder="Filter by Room (1-74)..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-50 focus:bg-white"
            />
          </div>

          {/* Status filter */}
          <div className="sm:col-span-4 flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-500 shrink-0">Status:</span>
            {(['All', 'Admitted', 'Discharged', 'Deceased'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Quick Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" /> Quick triage:
          </span>
          <button
            onClick={() => setQuickFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              quickFilter === 'all'
                ? 'bg-teal-100 text-teal-800 font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Patients
          </button>
          <button
            onClick={() => setQuickFilter('needs_temp')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              quickFilter === 'needs_temp'
                ? 'bg-amber-100 text-amber-800 font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Requires Temp Today
          </button>
          <button
            onClick={() => setQuickFilter('needs_doc')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              quickFilter === 'needs_doc'
                ? 'bg-blue-100 text-blue-800 font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Awaiting Doctor Rounds
          </button>
          <button
            onClick={() => setQuickFilter('discharge_eligible')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              quickFilter === 'discharge_eligible'
                ? 'bg-purple-100 text-purple-800 font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Eligible for Discharge (3+ Days)
          </button>
          <button
            onClick={() => setQuickFilter('has_fever')}
            className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
              quickFilter === 'has_fever'
                ? 'bg-rose-100 text-rose-800 font-bold'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Active Fever Spikes
          </button>
        </div>
      </div>

      {/* Patients Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-800 font-extrabold uppercase text-xs tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-4 px-5">Patient Info</th>
                <th className="py-4 px-5">Room</th>
                <th className="py-4 px-5">Admitted</th>
                <th className="py-4 px-5">Latest Temp</th>
                <th className="py-4 px-5">Today's Temp</th>
                <th className="py-4 px-5">Doctor Visit</th>
                <th className="py-4 px-5">Fever-Free Streak</th>
                <th className="py-4 px-5">Status / Eligibility</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-slate-400 font-medium">
                    No patients match your current filters.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const ev = evaluations[patient.id];
                  const hasFever =
                    (ev?.latestTemperature?.temperature || 0) >= feverThreshold;

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Patient Info */}
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm shrink-0">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-extrabold text-base text-slate-900 group-hover:text-teal-700 transition-colors block leading-tight">
                              {patient.name}
                            </span>
                            <div className="text-xs text-slate-500 font-mono font-semibold flex items-center gap-1.5 mt-0.5">
                              <span>{patient.patientId}</span>
                              <span>&bull;</span>
                              <span>{patient.age}y, {patient.gender}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Room Number */}
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 font-black text-sm text-slate-800 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
                          <Bed className="w-4 h-4 text-teal-600" />
                          #{patient.roomNumber}
                        </span>
                      </td>

                      {/* Admission Date */}
                      <td className="py-4 px-5 text-slate-700 font-medium text-sm">
                        {formatDate(patient.admissionDate)}
                      </td>

                      {/* Latest Temp */}
                      <td className="py-4 px-5 font-mono font-black text-base">
                        {ev?.latestTemperature ? (
                          <span className={hasFever ? 'text-rose-600 font-black' : 'text-teal-700'}>
                            {ev.latestTemperature.temperature.toFixed(1)}°C
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal text-sm">None</span>
                        )}
                      </td>

                      {/* Today's Temp Status */}
                      <td className="py-4 px-5">
                        {patient.status !== 'Admitted' ? (
                          <span className="text-slate-400 font-medium">—</span>
                        ) : ev?.hasRecordedToday ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            &check; Recorded ({ev.todayRecord?.temperature}°C)
                          </span>
                        ) : (
                          <button
                            onClick={() => setPatientForTemp(patient)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-200 hover:bg-amber-200 transition-colors shadow-xs"
                          >
                            <Thermometer className="w-3.5 h-3.5" />
                            Pending — Record
                          </button>
                        )}
                      </td>

                      {/* Doctor Visit Status */}
                      <td className="py-4 px-5">
                        {patient.status !== 'Admitted' ? (
                          <span className="text-slate-400 font-medium">—</span>
                        ) : ev?.hasDoctorVisitedToday ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                            &check; Visited Today
                          </span>
                        ) : !ev?.hasRecordedToday ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 text-slate-500">
                            Awaiting Temp
                          </span>
                        ) : (
                          <button
                            onClick={() => setPatientForVisit(patient)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
                          >
                            <Stethoscope className="w-3.5 h-3.5" />
                            Awaiting Rounds
                          </button>
                        )}
                      </td>

                      {/* Fever-Free Streak */}
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">
                            {ev?.feverFreeStreak || 0}d
                          </span>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3].map((d) => (
                              <span
                                key={d}
                                className={`w-2.5 h-2.5 rounded-full ${
                                  (ev?.feverFreeStreak || 0) >= d
                                    ? 'bg-emerald-500'
                                    : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Status / Discharge Eligibility */}
                      <td className="py-4 px-5">
                        {patient.status === 'Discharged' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700">
                            Discharged
                          </span>
                        ) : patient.status === 'Deceased' ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-rose-100 text-rose-800">
                            Deceased
                          </span>
                        ) : ev?.isDischargeEligible ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200 animate-pulse">
                            <ShieldCheck className="w-4 h-4" />
                            Discharge Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-teal-50 text-teal-700 border border-teal-200">
                            In Quarantine
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setSelectedPatient(patient)}
                            className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-xl transition-colors"
                            title="View Patient Clinical File"
                          >
                            <Eye className="w-5 h-5" />
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
      {selectedPatient && (
        <PatientDetailsModal
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {patientForTemp && (
        <RecordTemperatureModal
          patient={patientForTemp}
          onClose={() => setPatientForTemp(null)}
        />
      )}

      {patientForVisit && (
        <CompleteDoctorVisitModal
          patient={patientForVisit}
          onClose={() => setPatientForVisit(null)}
        />
      )}

      {showAddPatientModal && (
        <AddPatientModal
          onClose={() => setShowAddPatientModal(false)}
        />
      )}
    </div>
  );
};
