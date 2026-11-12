import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, TemperatureRecord, DoctorVisit } from '../../types';
import {
  X,
  Bed,
  Calendar,
  Thermometer,
  Stethoscope,
  TrendingUp,
  ShieldCheck,
  Clock,
  UserCheck,
  AlertTriangle,
  Plus,
  FileText,
  Activity,
  HeartCrack,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { formatDateTime, formatDate, getDaysBetween } from '../../utils/dateUtils';
import { RecordTemperatureModal } from './RecordTemperatureModal';
import { CompleteDoctorVisitModal } from './CompleteDoctorVisitModal';

interface PatientDetailsModalProps {
  patient: Patient;
  onClose: () => void;
}

export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  patient,
  onClose,
}) => {
  const {
    currentUser,
    temperatureRecords,
    doctorVisits,
    evaluations,
    feverThreshold,
    dischargePatient,
    recordDeceasedPatient,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'temperatures' | 'visits' | 'trend'>('trend');
  const [showRecordTemp, setShowRecordTemp] = useState(false);
  const [showDoctorVisit, setShowDoctorVisit] = useState(false);
  const [showConfirmDischarge, setShowConfirmDischarge] = useState(false);
  const [showConfirmDeceased, setShowConfirmDeceased] = useState(false);
  const [dischargeNotes, setDischargeNotes] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const evaluation = evaluations[patient.id];
  const patientTemps = temperatureRecords
    .filter((t) => t.patientId === patient.id)
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());

  const patientVisits = doctorVisits
    .filter((v) => v.patientId === patient.id)
    .sort((a, b) => new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime());

  const daysInQuarantine = getDaysBetween(patient.admissionDate);

  // Prepare chart data
  const chartData = patientTemps.map((t) => ({
    date: formatDate(t.dateOnly),
    time: formatDateTime(t.recordedAt),
    temperature: t.temperature,
    threshold: feverThreshold,
    hasFever: t.temperature >= feverThreshold,
  }));

  const handleDischarge = () => {
    const res = dischargePatient(patient.id, dischargeNotes);
    setActionMessage(res.message);
    setShowConfirmDischarge(false);
  };

  const handleDeceased = () => {
    const res = recordDeceasedPatient(patient.id, dischargeNotes);
    setActionMessage(res.message);
    setShowConfirmDeceased(false);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header Bar */}
          <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-teal-500/20 text-teal-400 rounded-xl border border-teal-500/30">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-white">{patient.name}</h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-800 text-teal-300 border border-slate-700">
                    {patient.patientId}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                      patient.status === 'Admitted'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                        : patient.status === 'Discharged'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {patient.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Room #{patient.roomNumber} &bull; Admitted: {formatDate(patient.admissionDate)} ({daysInQuarantine} days in quarantine)
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Action Notification Message */}
          {actionMessage && (
            <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-900 px-6 py-2.5 text-xs font-semibold flex items-center justify-between">
              <span>{actionMessage}</span>
              <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Content Area */}
          <div className="overflow-y-auto p-6 space-y-6 flex-1">
            {/* Top Quick Stats Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Stat 1: Room & Demographics */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Demographics
                </span>
                <div className="text-sm font-extrabold text-slate-800 mt-1">
                  {patient.age} yrs &bull; {patient.gender}
                </div>
                <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-teal-600" />
                  Isolation Room #{patient.roomNumber}
                </div>
              </div>

              {/* Stat 2: Latest Temperature */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Latest Vitals
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span
                    className={`text-xl font-black ${
                      (evaluation?.latestTemperature?.temperature || 0) >= feverThreshold
                        ? 'text-rose-600'
                        : 'text-teal-700'
                    }`}
                  >
                    {evaluation?.latestTemperature?.temperature
                      ? `${evaluation.latestTemperature.temperature}°C`
                      : 'None'}
                  </span>
                  {(evaluation?.latestTemperature?.temperature || 0) >= feverThreshold ? (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800">
                      Fever
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                      Fever-Free
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  {evaluation?.hasRecordedToday
                    ? 'Recorded today'
                    : 'Pending today measurement'}
                </span>
              </div>

              {/* Stat 3: Fever-Free Streak */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Fever-Free Streak
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl font-black text-slate-900">
                    {evaluation?.feverFreeStreak || 0}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">of 3 days required</span>
                </div>
                {/* Visual Streak Pill */}
                <div className="flex items-center gap-1 mt-1.5">
                  {[1, 2, 3].map((day) => (
                    <div
                      key={day}
                      className={`h-2 flex-1 rounded-full ${
                        (evaluation?.feverFreeStreak || 0) >= day
                          ? 'bg-emerald-500'
                          : 'bg-slate-200'
                      }`}
                      title={`Day ${day}: ${(evaluation?.feverFreeStreak || 0) >= day ? 'Cleared' : 'Pending'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Stat 4: Discharge Eligibility */}
              <div
                className={`border rounded-2xl p-3.5 ${
                  evaluation?.isDischargeEligible
                    ? 'bg-purple-50 border-purple-200 text-purple-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
                  Discharge Status
                </span>
                <div className="text-sm font-black mt-1 flex items-center gap-1.5">
                  {evaluation?.isDischargeEligible ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-purple-700" />
                      <span>Eligible for Discharge</span>
                    </>
                  ) : (
                    <span>Quarantine Active</span>
                  )}
                </div>
                <span className="text-[10px] opacity-75 mt-0.5 block">
                  {evaluation?.isDischargeEligible
                    ? 'Criteria met (≥ 3 fever-free days)'
                    : `${3 - (evaluation?.feverFreeStreak || 0)} day(s) fever-free remaining`}
                </span>
              </div>
            </div>

            {/* Role Action Shortcuts Bar */}
            {patient.status === 'Admitted' && (
              <div className="bg-slate-100/80 border border-slate-200 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-slate-600">
                  <strong className="text-slate-800">Quick Actions:</strong> Available clinical operations for {patient.name}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {/* Nurse Action: Record Temp */}
                  <button
                    onClick={() => setShowRecordTemp(true)}
                    disabled={evaluation?.hasRecordedToday}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                      evaluation?.hasRecordedToday
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    <Thermometer className="w-3.5 h-3.5" />
                    {evaluation?.hasRecordedToday ? 'Temp Recorded Today' : 'Record Today Temp'}
                  </button>

                  {/* Doctor Action: Complete Visit */}
                  <button
                    onClick={() => setShowDoctorVisit(true)}
                    disabled={!evaluation?.hasRecordedToday || evaluation?.hasDoctorVisitedToday}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                      !evaluation?.hasRecordedToday
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : evaluation?.hasDoctorVisitedToday
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Stethoscope className="w-3.5 h-3.5" />
                    {!evaluation?.hasRecordedToday
                      ? 'Temp Needed First'
                      : evaluation?.hasDoctorVisitedToday
                      ? 'Doctor Visited Today'
                      : 'Complete Doctor Visit'}
                  </button>

                  {/* Admin Action: Discharge */}
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => setShowConfirmDischarge(true)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-xs ${
                        evaluation?.isDischargeEligible
                          ? 'bg-purple-600 hover:bg-purple-700 text-white ring-2 ring-purple-300'
                          : 'bg-slate-700 hover:bg-slate-800 text-white'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Process Discharge
                    </button>
                  )}

                  {/* Terminal Outcome (Clinical option) */}
                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => setShowConfirmDeceased(true)}
                      className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Record Terminal Outcome (Deceased)"
                    >
                      Terminal Outcome
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 border-b border-slate-200">
              <button
                onClick={() => setActiveTab('trend')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'trend'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Temperature Trend Chart
              </button>
              <button
                onClick={() => setActiveTab('temperatures')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'temperatures'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Thermometer className="w-4 h-4" />
                Temperature History ({patientTemps.length})
              </button>
              <button
                onClick={() => setActiveTab('visits')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                  activeTab === 'visits'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Stethoscope className="w-4 h-4" />
                Doctor Visits & Clinical Notes ({patientVisits.length})
              </button>
            </div>

            {/* Tab 1: Temperature Trend Chart */}
            {activeTab === 'trend' && (
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Longitudinal Temperature Trajectory (°C)
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Red reference line indicates the {feverThreshold}°C fever discharge boundary. Readings below this line count toward the 3-day streak.
                      </p>
                    </div>
                  </div>

                  {chartData.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-xs text-slate-400">
                      No temperature readings recorded yet.
                    </div>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                          <YAxis domain={[35.5, 40.5]} tick={{ fontSize: 11 }} />
                          <Tooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs space-y-1">
                                    <div className="font-bold text-teal-300">{data.date}</div>
                                    <div className="text-[11px] text-slate-300">{data.time}</div>
                                    <div className="text-sm font-black">
                                      {data.temperature}°C
                                      <span
                                        className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded ${
                                          data.hasFever ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                                        }`}
                                      >
                                        {data.hasFever ? 'Fever' : 'Fever-Free'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <ReferenceLine
                            y={feverThreshold}
                            stroke="#e11d48"
                            strokeDasharray="4 4"
                            label={{
                              value: `Fever Threshold (${feverThreshold}°C)`,
                              fill: '#e11d48',
                              fontSize: 10,
                              position: 'top',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="temperature"
                            stroke="#0d9488"
                            strokeWidth={3}
                            dot={{ r: 5, fill: '#0d9488', strokeWidth: 2, stroke: '#fff' }}
                            activeDot={{ r: 7 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Temperatures Table */}
            {activeTab === 'temperatures' && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Date & Time</th>
                      <th className="py-3 px-4">Reading (°C)</th>
                      <th className="py-3 px-4">Classification</th>
                      <th className="py-3 px-4">Recorded By</th>
                      <th className="py-3 px-4">Nurse Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {patientTemps.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-400">
                          No temperature history available.
                        </td>
                      </tr>
                    ) : (
                      patientTemps
                        .slice()
                        .reverse()
                        .map((rec) => (
                          <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-800">
                              {formatDateTime(rec.recordedAt)}
                            </td>
                            <td className="py-3 px-4 font-mono font-bold text-sm">
                              <span className={rec.hasFever ? 'text-rose-600' : 'text-teal-700'}>
                                {rec.temperature.toFixed(1)}°C
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  rec.hasFever
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {rec.hasFever ? 'Fever Spike' : 'Fever-Free Day'}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-slate-600">{rec.recordedBy}</td>
                            <td className="py-3 px-4 text-slate-500 italic">
                              {rec.notes || '—'}
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Doctor Visits */}
            {activeTab === 'visits' && (
              <div className="space-y-3">
                {patientVisits.length === 0 ? (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                    No doctor rounds recorded for this patient yet.
                  </div>
                ) : (
                  patientVisits.map((visit) => (
                    <div
                      key={visit.id}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-blue-600" />
                          <span className="font-bold text-slate-800 text-xs">{visit.doctorName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {formatDateTime(visit.visitedAt)}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            visit.recommendedDischarge
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-blue-100 text-blue-800 border border-blue-200'
                          }`}
                        >
                          {visit.treatmentDecision}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-medium">
                        {visit.clinicalNotes}
                      </p>
                      {visit.observations && (
                        <div className="mt-2 text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200">
                          <strong>Observations:</strong> {visit.observations}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested Modals */}
      {showRecordTemp && (
        <RecordTemperatureModal
          patient={patient}
          onClose={() => setShowRecordTemp(false)}
        />
      )}

      {showDoctorVisit && (
        <CompleteDoctorVisitModal
          patient={patient}
          onClose={() => setShowDoctorVisit(false)}
        />
      )}

      {/* Discharge Confirmation Modal */}
      {showConfirmDischarge && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-purple-600 mb-3">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-base">Confirm Patient Discharge</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Confirming discharge for <strong>{patient.name}</strong> will officially release <strong>Room #{patient.roomNumber}</strong> back to the available inventory and record the recovery outcome in the analytics registry.
            </p>

            {/* Streak validation note */}
            {(evaluation?.feverFreeStreak || 0) >= 3 ? (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                &check; Verified: Patient has satisfied the strict 3-day fever-free protocol.
              </div>
            ) : (
              <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                &excl; Note: Patient has only {evaluation?.feverFreeStreak || 0} fever-free day(s). Administrative override will be documented.
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Discharge Summary / Home Instructions
              </label>
              <textarea
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
                placeholder="e.g. Cleared 3 full days fever-free. Provided viral safety guidelines and follow-up appointment."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowConfirmDischarge(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDischarge}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm"
              >
                Confirm & Release Bed #{patient.roomNumber}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deceased Confirmation Modal */}
      {showConfirmDeceased && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-2 text-rose-600 mb-3">
              <HeartCrack className="w-6 h-6 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-base">Record Terminal Outcome</h3>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Record deceased status for <strong>{patient.name}</strong>. This will release <strong>Room #{patient.roomNumber}</strong> and update facility mortality rate analytics against the 15% benchmark.
            </p>
            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Clinical Outcome Notes
              </label>
              <textarea
                value={dischargeNotes}
                onChange={(e) => setDischargeNotes(e.target.value)}
                placeholder="Details of viral complications..."
                rows={2}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowConfirmDeceased(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDeceased}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm"
              >
                Record Deceased & Release Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
