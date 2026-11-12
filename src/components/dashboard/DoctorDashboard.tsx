import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  Stethoscope,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  Clock,
  Bed,
  Eye,
  FileText,
  UserCheck,
} from 'lucide-react';
import { CompleteDoctorVisitModal } from '../patients/CompleteDoctorVisitModal';
import { PatientDetailsModal } from '../patients/PatientDetailsModal';

export const DoctorDashboard: React.FC = () => {
  const { activePatients, evaluations, feverThreshold, currentUser } = useApp();

  const [filterQueue, setFilterQueue] = useState<
    'all_priority' | 'needs_visit' | 'fever_spikes' | 'improving' | 'discharge_ready' | 'visited'
  >('needs_visit');

  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<Patient | null>(null);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);

  // Categorize
  const tempsAvailable = activePatients.filter((p) => evaluations[p.id]?.hasRecordedToday);
  const awaitingVisits = activePatients.filter(
    (p) => evaluations[p.id]?.hasRecordedToday && !evaluations[p.id]?.hasDoctorVisitedToday
  );
  const alreadyVisitedToday = activePatients.filter((p) => evaluations[p.id]?.hasDoctorVisitedToday);
  const dischargeEligible = activePatients.filter((p) => evaluations[p.id]?.isDischargeEligible);
  const feverPatients = activePatients.filter(
    (p) => (evaluations[p.id]?.latestTemperature?.temperature || 0) >= feverThreshold
  );
  const improvingPatients = activePatients.filter(
    (p) => evaluations[p.id]?.trend === 'improving' || evaluations[p.id]?.feverFreeStreak >= 1
  );

  // Priority queue sort:
  // 1. Awaiting visit with fever (highest priority)
  // 2. Awaiting visit eligible for discharge
  // 3. Awaiting visit other
  // 4. Already visited
  // 5. Awaiting temp
  const sortedPatients = [...activePatients].sort((a, b) => {
    const evA = evaluations[a.id];
    const evB = evaluations[b.id];

    const aNeedsVisit = evA?.hasRecordedToday && !evA?.hasDoctorVisitedToday;
    const bNeedsVisit = evB?.hasRecordedToday && !evB?.hasDoctorVisitedToday;

    if (aNeedsVisit && !bNeedsVisit) return -1;
    if (!aNeedsVisit && bNeedsVisit) return 1;

    // If both need visit, fever comes first
    const aTemp = evA?.latestTemperature?.temperature || 0;
    const bTemp = evB?.latestTemperature?.temperature || 0;
    return bTemp - aTemp;
  });

  const displayedPatients = sortedPatients.filter((patient) => {
    const ev = evaluations[patient.id];
    if (filterQueue === 'needs_visit') {
      return ev?.hasRecordedToday && !ev?.hasDoctorVisitedToday;
    }
    if (filterQueue === 'fever_spikes') {
      return (ev?.latestTemperature?.temperature || 0) >= feverThreshold;
    }
    if (filterQueue === 'improving') {
      return ev?.trend === 'improving' || ev?.feverFreeStreak >= 1;
    }
    if (filterQueue === 'discharge_ready') {
      return ev?.isDischargeEligible;
    }
    if (filterQueue === 'visited') {
      return ev?.hasDoctorVisitedToday;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Welcome & Rounds Header */}
      <div className="bg-gradient-to-r from-blue-800 via-indigo-900 to-slate-900 rounded-3xl p-7 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-blue-200 border border-white/20 mb-2.5">
              <Stethoscope className="w-4 h-4 text-blue-300" /> Attending Physician Clinical Station
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              {currentUser?.name || 'Dr. Gregory Mercer, MD'}
            </h1>
            <p className="text-sm text-blue-100 font-medium mt-1.5 max-w-2xl leading-relaxed">
              Priority rounds queue based on daily thermometry records. Patients with high viral fevers and those ready for discharge are highlighted below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (awaitingVisits.length > 0) {
                  setSelectedPatientForVisit(awaitingVisits[0]);
                }
              }}
              disabled={awaitingVisits.length === 0}
              className="flex items-center gap-2 px-6 py-3.5 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl text-sm font-black shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
            >
              <Stethoscope className="w-5 h-5" />
              {awaitingVisits.length > 0
                ? `Start Next Consultation (${awaitingVisits.length} Ready)`
                : 'All Rounds Completed!'}
            </button>
          </div>
        </div>
      </div>

      {/* Top 5 Metric Cards */}
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
            Active Patients
          </span>
        </div>

        {/* Card 2: Temps Available */}
        <div className="bg-white rounded-3xl border border-teal-200 bg-teal-50/25 p-5 shadow-xs">
          <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
            Temps Recorded
          </span>
          <div className="text-3xl font-black text-teal-800 mt-1.5">
            {tempsAvailable.length}
          </div>
          <span className="text-xs text-teal-700 font-bold mt-1 block flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-teal-600" /> Vitals Ready for Review
          </span>
        </div>

        {/* Card 3: Awaiting Doctor Visits */}
        <div className="bg-white rounded-3xl border border-blue-200 bg-blue-50/25 p-5 shadow-xs">
          <span className="text-xs font-bold text-blue-700 uppercase tracking-wider block">
            Awaiting Rounds
          </span>
          <div className="text-3xl font-black text-blue-800 mt-1.5">
            {awaitingVisits.length}
          </div>
          <span className="text-xs text-blue-700 font-bold mt-1 block flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-600" /> Action Needed
          </span>
        </div>

        {/* Card 4: Visited Today */}
        <div className="bg-white rounded-3xl border border-emerald-200 bg-emerald-50/25 p-5 shadow-xs">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            Visited Today
          </span>
          <div className="text-3xl font-black text-emerald-800 mt-1.5">
            {alreadyVisitedToday.length}
          </div>
          <span className="text-xs text-emerald-700 font-bold mt-1 block flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Rounds Completed
          </span>
        </div>

        {/* Card 5: Discharge Eligible */}
        <div className="bg-white rounded-3xl border border-purple-200 bg-purple-50/25 p-5 shadow-xs">
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider block">
            Discharge Ready
          </span>
          <div className="text-3xl font-black text-purple-800 mt-1.5">
            {dischargeEligible.length}
          </div>
          <span className="text-xs text-purple-700 font-bold mt-1 block flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-600" /> &ge;3 Days Fever-Free
          </span>
        </div>
      </div>

      {/* Priority Patient Queue */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              Clinical Priority Rounds Queue
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Attending physicians review recorded temperatures before documenting clinical progress and treatment decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setFilterQueue('needs_visit')}
              className={`px-3.5 py-2 rounded-xl font-extrabold transition-all ${
                filterQueue === 'needs_visit'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Needs Visit ({awaitingVisits.length})
            </button>
            <button
              onClick={() => setFilterQueue('fever_spikes')}
              className={`px-3.5 py-2 rounded-xl font-extrabold transition-all ${
                filterQueue === 'fever_spikes'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Fever Spikes ({feverPatients.length})
            </button>
            <button
              onClick={() => setFilterQueue('improving')}
              className={`px-3.5 py-2 rounded-xl font-extrabold transition-all ${
                filterQueue === 'improving'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Improving Trends ({improvingPatients.length})
            </button>
            <button
              onClick={() => setFilterQueue('discharge_ready')}
              className={`px-3.5 py-2 rounded-xl font-extrabold transition-all ${
                filterQueue === 'discharge_ready'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Discharge Ready ({dischargeEligible.length})
            </button>
            <button
              onClick={() => setFilterQueue('all_priority')}
              className={`px-3.5 py-2 rounded-xl font-extrabold transition-all ${
                filterQueue === 'all_priority'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Census ({activePatients.length})
            </button>
          </div>
        </div>

        {/* Priority Queue Cards */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedPatients.length === 0 ? (
            <div className="col-span-2 py-16 text-center text-slate-400 text-sm font-medium">
              No patients match the selected queue filter.
            </div>
          ) : (
            displayedPatients.map((patient) => {
              const ev = evaluations[patient.id];
              const hasRecorded = ev?.hasRecordedToday;
              const hasVisited = ev?.hasDoctorVisitedToday;
              const latestTemp = ev?.latestTemperature?.temperature || 0;
              const hasFever = latestTemp >= feverThreshold;

              return (
                <div
                  key={patient.id}
                  className={`border rounded-3xl p-5 transition-all flex flex-col justify-between ${
                    hasFever
                      ? 'bg-rose-50/40 border-rose-200 hover:border-rose-300 shadow-xs'
                      : ev?.isDischargeEligible
                      ? 'bg-purple-50/40 border-purple-200 hover:border-purple-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3.5">
                      <div className="flex items-center space-x-2.5">
                        <span className="font-black text-base text-slate-900">{patient.name}</span>
                        <span className="text-xs text-slate-500 font-mono font-semibold">
                          {patient.patientId}
                        </span>
                      </div>
                      <span className="text-xs font-black text-slate-800 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200 flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-teal-600" /> Room #{patient.roomNumber}
                      </span>
                    </div>

                    {/* Vitals Summary Strip */}
                    <div className="grid grid-cols-3 gap-2.5 mb-3.5">
                      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                        <span className="text-xs text-slate-500 block font-bold">
                          Today's Temp
                        </span>
                        {hasRecorded ? (
                          <span
                            className={`font-black text-base ${
                              hasFever ? 'text-rose-600' : 'text-teal-700'
                            }`}
                          >
                            {ev?.todayRecord?.temperature}°C
                          </span>
                        ) : (
                          <span className="text-xs font-black text-amber-600">Pending</span>
                        )}
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                        <span className="text-xs text-slate-500 block font-bold">
                          Fever-Free Streak
                        </span>
                        <span className="font-black text-slate-800 text-sm">
                          {ev?.feverFreeStreak || 0} / 3 days
                        </span>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                        <span className="text-xs text-slate-500 block font-bold">
                          Rounds Status
                        </span>
                        {hasVisited ? (
                          <span className="text-xs font-black text-emerald-600">&check; Visited</span>
                        ) : hasRecorded ? (
                          <span className="text-xs font-black text-blue-600">Awaiting</span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Temp First</span>
                        )}
                      </div>
                    </div>

                    {/* Clinical Triage Indicators */}
                    <div className="flex flex-wrap items-center gap-2 mb-3.5 text-xs font-extrabold">
                      {hasFever && (
                        <span className="px-3 py-1 rounded-xl bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Active Fever Spike
                        </span>
                      )}
                      {ev?.isDischargeEligible && (
                        <span className="px-3 py-1 rounded-xl bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5" /> Discharge Eligible
                        </span>
                      )}
                      {ev?.trend === 'improving' && !hasFever && (
                        <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                          <TrendingDown className="w-3.5 h-3.5" /> Temperature Improving
                        </span>
                      )}
                    </div>

                    {/* Latest Doctor Note snippet if exists */}
                    {ev?.todayVisit && (
                      <div className="text-xs text-slate-700 bg-white p-3 rounded-2xl border border-slate-200 mb-3.5 leading-relaxed">
                        <strong className="text-slate-900">Visit Decision:</strong> {ev.todayVisit.treatmentDecision}
                        <p className="text-slate-500 truncate mt-1 italic">&quot;{ev.todayVisit.clinicalNotes}&quot;</p>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <button
                      onClick={() => setSelectedPatientForDetails(patient)}
                      className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" /> Clinical File
                    </button>

                    <button
                      onClick={() => setSelectedPatientForVisit(patient)}
                      disabled={!hasRecorded || hasVisited}
                      className={`flex items-center gap-2 px-5 py-2.5 text-xs font-extrabold rounded-xl transition-all ${
                        !hasRecorded
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : hasVisited
                          ? 'bg-slate-100 text-slate-500 cursor-not-allowed border border-slate-200'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 hover:scale-[1.02]'
                      }`}
                    >
                      <Stethoscope className="w-4 h-4" />
                      {!hasRecorded
                        ? 'Temp Required First'
                        : hasVisited
                        ? 'Visit Completed'
                        : 'Complete Visit'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modals */}
      {selectedPatientForVisit && (
        <CompleteDoctorVisitModal
          patient={selectedPatientForVisit}
          onClose={() => setSelectedPatientForVisit(null)}
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
