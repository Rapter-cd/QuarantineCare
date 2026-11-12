import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient, TreatmentDecision } from '../../types';
import {
  Stethoscope,
  X,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  Bed,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { getTodayDateString, formatDateTime } from '../../utils/dateUtils';

interface CompleteDoctorVisitModalProps {
  patient: Patient;
  onClose: () => void;
  onSuccess?: () => void;
}

const TREATMENT_DECISIONS: TreatmentDecision[] = [
  'Continue Standard Protocol',
  'Prescribe Antiviral & Antipyretic',
  'Order Chest X-Ray & Blood Panel',
  'Recommend Discharge Review',
  'Transfer to Intensive Monitoring',
  'Hydration & Supportive Care',
];

export const CompleteDoctorVisitModal: React.FC<CompleteDoctorVisitModalProps> = ({
  patient,
  onClose,
  onSuccess,
}) => {
  const { completeDoctorVisit, evaluations, feverThreshold } = useApp();
  const evaluation = evaluations[patient.id];
  const today = getTodayDateString();

  const [decision, setDecision] = useState<TreatmentDecision>(
    evaluation?.isDischargeEligible
      ? 'Recommend Discharge Review'
      : 'Continue Standard Protocol'
  );
  const [clinicalNotes, setClinicalNotes] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Workflow checks
  const tempRecordedToday = evaluation?.hasRecordedToday;
  const alreadyVisitedToday = evaluation?.hasDoctorVisitedToday;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tempRecordedToday) {
      setError(
        "Critical Workflow Rule: A doctor visit cannot be marked as completed until the patient's daily temperature has been recorded by nursing staff."
      );
      return;
    }

    if (!clinicalNotes.trim()) {
      setError('Please provide clinical notes for this encounter.');
      return;
    }

    setIsSubmitting(true);
    const result = completeDoctorVisit(patient.id, decision, clinicalNotes, observations);

    if (!result.success) {
      setError(result.message);
      setIsSubmitting(false);
      return;
    }

    setSuccessMsg(result.message);
    setIsSubmitting(false);

    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
    }, 1400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Stethoscope className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Complete Doctor Clinical Visit</h3>
              <p className="text-xs text-blue-200 font-medium mt-0.5">
                Daily Attending Physician Rounds
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Patient Overview */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
              <div>
                <span className="text-xs font-mono text-slate-500 font-bold">{patient.patientId}</span>
                <h4 className="font-bold text-slate-900 text-sm">{patient.name}</h4>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
                <Bed className="w-3.5 h-3.5" /> Room #{patient.roomNumber}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block">Today's Temp:</span>
                {tempRecordedToday ? (
                  <span
                    className={`font-bold ${
                      evaluation.todayRecord!.temperature >= feverThreshold
                        ? 'text-rose-600'
                        : 'text-emerald-600'
                    }`}
                  >
                    {evaluation.todayRecord?.temperature}°C
                  </span>
                ) : (
                  <span className="font-bold text-amber-600">Pending Measurement</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block">Fever-Free Streak:</span>
                <span className="font-bold text-slate-800">
                  {evaluation?.feverFreeStreak || 0} consecutive days
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Discharge Status:</span>
                <span
                  className={`font-bold ${
                    evaluation?.isDischargeEligible ? 'text-purple-600' : 'text-slate-600'
                  }`}
                >
                  {evaluation?.isDischargeEligible ? 'Eligible for Discharge' : 'In Observation'}
                </span>
              </div>
            </div>
          </div>

          {/* Workflow Barrier: Missing Temp Today */}
          {!tempRecordedToday && (
            <div className="mb-4 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-rose-800 font-bold">
                  Workflow Lock: Temperature Required
                </strong>
                According to virus isolation guidelines, a doctor visit cannot be marked as completed until today's temperature reading is recorded by nursing staff. Please request nurse vitals first.
              </div>
            </div>
          )}

          {/* Duplicate Visit Warning */}
          {alreadyVisitedToday && (
            <div className="mb-4 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Visit Already Completed Today</strong>
                Doctor rounds have already been logged for this patient today ({formatDateTime(evaluation.todayVisit?.visitedAt)}).
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="font-semibold">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Auto Timestamps */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-100/70 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Date: <strong className="text-slate-800">{today}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Timestamp: <strong className="text-slate-800">Current Encounter</strong></span>
              </div>
            </div>

            {/* Treatment Decision */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Treatment Decision & Plan <span className="text-rose-500">*</span>
              </label>
              <select
                disabled={!tempRecordedToday || alreadyVisitedToday || !!successMsg}
                value={decision}
                onChange={(e) => setDecision(e.target.value as TreatmentDecision)}
                className="w-full px-3 py-2.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {TREATMENT_DECISIONS.map((dec) => (
                  <option key={dec} value={dec}>
                    {dec}
                  </option>
                ))}
              </select>
            </div>

            {/* Clinical Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Clinical Notes & Assessment <span className="text-rose-500">*</span>
              </label>
              <textarea
                disabled={!tempRecordedToday || alreadyVisitedToday || !!successMsg}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                rows={3}
                required
                placeholder="Document respiratory evaluation, symptom trajectory, lung auscultation, and medication updates..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Optional Observations */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Additional Observations (Optional)
              </label>
              <input
                type="text"
                disabled={!tempRecordedToday || alreadyVisitedToday || !!successMsg}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="e.g. Patient tolerating light oral diet, no cough reported."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!tempRecordedToday || alreadyVisitedToday || isSubmitting || !!successMsg}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-md shadow-blue-600/20 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                {!tempRecordedToday
                  ? 'Awaiting Temp Recording'
                  : alreadyVisitedToday
                  ? 'Already Visited Today'
                  : 'Complete Doctor Visit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
