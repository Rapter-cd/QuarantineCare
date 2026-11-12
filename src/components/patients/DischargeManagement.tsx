import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, PatientOutcome } from '../../types';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Bed,
  User,
  Clock,
  Sparkles,
  ArrowRight,
  FileCheck,
  History,
  AlertCircle,
} from 'lucide-react';
import { formatDate, getDaysBetween, getTodayDateString } from '../../utils/dateUtils';
import { PatientDetailsModal } from './PatientDetailsModal';

export const DischargeManagement: React.FC = () => {
  const {
    activePatients,
    evaluations,
    dischargePatient,
    outcomes,
    totalCapacity,
    availableBedsCount,
  } = useApp();

  const [selectedPatientForDischarge, setSelectedPatientForDischarge] = useState<Patient | null>(null);
  const [selectedPatientDetails, setSelectedPatientDetails] = useState<Patient | null>(null);
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'eligible' | 'history'>('eligible');

  // Filter eligible patients
  const eligiblePatients = activePatients.filter(
    (p) => evaluations[p.id]?.isDischargeEligible
  );

  // Near-eligible patients (streak = 2 days)
  const nearEligiblePatients = activePatients.filter(
    (p) => evaluations[p.id]?.feverFreeStreak === 2
  );

  // Historical recoveries
  const recoveredOutcomes = outcomes.filter((o) => o.outcomeType === 'Recovered');

  const handleConfirmDischarge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForDischarge) return;

    const res = dischargePatient(selectedPatientForDischarge.id, dischargeNotes);
    if (res.success) {
      setSuccessMsg(res.message);
      setSelectedPatientForDischarge(null);
      setDischargeNotes('');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-purple-600" />
            Discharge Management & Protocol Clearance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic 3-consecutive-day fever-free discharge criteria detection & room clearance
          </p>
        </div>

        {/* Quick Bed Inventory Pill */}
        <div className="flex items-center gap-3 bg-purple-50 border border-purple-200 px-4 py-2 rounded-2xl">
          <div className="text-xs">
            <span className="text-purple-600 font-bold block">Discharge Queue</span>
            <strong className="text-purple-900 text-sm font-extrabold">
              {eligiblePatients.length} Patients Ready
            </strong>
          </div>
          <div className="h-8 w-px bg-purple-200" />
          <div className="text-xs">
            <span className="text-purple-600 font-bold block">Sanitized Beds</span>
            <strong className="text-slate-800 text-sm font-extrabold">
              {availableBedsCount} / {totalCapacity} Vacant
            </strong>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tab switch */}
      <div className="flex items-center space-x-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('eligible')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'eligible'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-500" />
          Eligible Patients ({eligiblePatients.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-purple-600 text-purple-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <History className="w-4 h-4 text-slate-500" />
          Historical Discharges ({recoveredOutcomes.length})
        </button>
      </div>

      {activeTab === 'eligible' && (
        <>
          {/* Main Eligible Patients Card */}
          <div className="bg-white rounded-3xl border border-purple-200/80 p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-purple-600" />
                  Protocol-Cleared Patients Awaiting Administrative Discharge
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These patients have successfully recorded 3 or more full consecutive fever-free calendar days (&lt; 38.0°C).
                </p>
              </div>
            </div>

            {eligiblePatients.length === 0 ? (
              <div className="py-12 text-center">
                <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-bold text-slate-700 text-sm">No Patients Currently Eligible</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Patients will appear here automatically as soon as their third consecutive fever-free day is recorded.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eligiblePatients.map((patient) => {
                  const ev = evaluations[patient.id];
                  const daysInFacility = getDaysBetween(patient.admissionDate);

                  return (
                    <div
                      key={patient.id}
                      className="border border-purple-200 bg-gradient-to-br from-purple-50/40 via-white to-purple-50/20 rounded-2xl p-5 hover:border-purple-300 transition-all shadow-xs"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-purple-100">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                            {patient.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{patient.name}</h4>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {patient.patientId} &bull; {patient.age}y {patient.gender}
                            </div>
                          </div>
                        </div>

                        <span className="text-xs font-bold text-purple-800 bg-purple-100 px-3 py-1 rounded-xl border border-purple-200 flex items-center gap-1.5">
                          <Bed className="w-3.5 h-3.5" /> Room #{patient.roomNumber}
                        </span>
                      </div>

                      {/* Clearance Highlights */}
                      <div className="grid grid-cols-3 gap-2 py-3 text-xs">
                        <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Fever-Free Streak
                          </span>
                          <span className="font-extrabold text-emerald-600 text-sm">
                            {ev?.feverFreeStreak} Full Days &check;
                          </span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Today's Temp
                          </span>
                          <span className="font-extrabold text-teal-700 text-sm">
                            {ev?.todayRecord?.temperature}°C
                          </span>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-purple-100">
                          <span className="text-[10px] text-slate-400 block font-semibold">
                            Days In Isolation
                          </span>
                          <span className="font-extrabold text-slate-800 text-sm">
                            {daysInFacility} days
                          </span>
                        </div>
                      </div>

                      {/* Doctor Recommendation status */}
                      <div className="text-[11px] text-slate-600 mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        {ev?.todayVisit ? (
                          <span>
                            <strong>Doctor Assessment:</strong> {ev.todayVisit.treatmentDecision} (&quot;{ev.todayVisit.clinicalNotes.slice(0, 70)}...&quot;)
                          </span>
                        ) : (
                          <span className="text-amber-700 font-medium">
                            Awaiting physician final discharge sign-off note
                          </span>
                        )}
                      </div>

                      {/* Discharge Button */}
                      <div className="flex items-center justify-end space-x-2 pt-2 border-t border-purple-100">
                        <button
                          onClick={() => setSelectedPatientDetails(patient)}
                          className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          View Clinical File
                        </button>
                        <button
                          onClick={() => setSelectedPatientForDischarge(patient)}
                          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20 transition-all"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          Confirm Discharge & Release Room #{patient.roomNumber}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Near Eligible Patients Section */}
          {nearEligiblePatients.length > 0 && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Approaching Clearance: 2 Days Fever-Free (1 Day Remaining)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Patients who need 1 additional consecutive fever-free day to reach discharge eligibility.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {nearEligiblePatients.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl text-xs flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900 block">{p.name}</span>
                      <span className="text-[11px] text-slate-500">
                        Room #{p.roomNumber} &bull; 2 of 3 days cleared
                      </span>
                    </div>
                    <button
                      onClick={() => setSelectedPatientDetails(p)}
                      className="px-2.5 py-1 text-[11px] font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                    >
                      Track
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tab 2: Historical Discharges */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-sm">Historical Patient Discharge Registry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Archived records of successfully cured and released quarantine patients
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Patient Name & ID</th>
                  <th className="py-3 px-4">Demographics</th>
                  <th className="py-3 px-4">Prior Room</th>
                  <th className="py-3 px-4">Admission</th>
                  <th className="py-3 px-4">Discharge Date</th>
                  <th className="py-3 px-4">Stay Duration</th>
                  <th className="py-3 px-4">Outcome</th>
                  <th className="py-3 px-4">Discharge Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recoveredOutcomes.map((out) => (
                  <tr key={out.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{out.patientName}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{out.patientDisplayId}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {out.age} yrs &bull; {out.gender}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-slate-700">Room #{out.roomNumber}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatDate(out.admissionDate)}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{formatDate(out.outcomeDate)}</td>
                    <td className="py-3 px-4 font-bold text-teal-700">{out.daysInQuarantine} days</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        &check; Recovered
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">{out.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Discharge Confirmation Modal */}
      {selectedPatientForDischarge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-purple-600 mb-3">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-base">Official Discharge Processing</h3>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              You are officially releasing <strong>{selectedPatientForDischarge.name}</strong> from <strong>Room #{selectedPatientForDischarge.roomNumber}</strong>.
            </p>

            <form onSubmit={handleConfirmDischarge} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Discharge Summary & Post-Care Instructions
                </label>
                <textarea
                  value={dischargeNotes}
                  onChange={(e) => setDischargeNotes(e.target.value)}
                  required
                  placeholder="e.g. 3 consecutive fever-free days verified. Oxygen sat 99%. Patient educated on post-quarantine precautions..."
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[11px] text-purple-900">
                <strong>Inventory Impact:</strong> Room #{selectedPatientForDischarge.roomNumber} will immediately revert to Vacant status, incrementing available bed inventory.
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedPatientForDischarge(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-md shadow-purple-600/20"
                >
                  Confirm Discharge & Release Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clinical Details Modal */}
      {selectedPatientDetails && (
        <PatientDetailsModal
          patient={selectedPatientDetails}
          onClose={() => setSelectedPatientDetails(null)}
        />
      )}
    </div>
  );
};
