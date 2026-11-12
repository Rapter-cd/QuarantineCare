import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  Thermometer,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Calendar,
  User,
  Bed,
} from 'lucide-react';
import { formatDateTime, getTodayDateString } from '../../utils/dateUtils';

interface RecordTemperatureModalProps {
  patient: Patient;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RecordTemperatureModal: React.FC<RecordTemperatureModalProps> = ({
  patient,
  onClose,
  onSuccess,
}) => {
  const { recordTemperature, feverThreshold, evaluations } = useApp();
  const [temperature, setTemperature] = useState<string>('37.0');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const evaluation = evaluations[patient.id];
  const today = getTodayDateString();
  const alreadyRecorded = evaluation?.hasRecordedToday;

  const handleQuickTemp = (val: number) => {
    setTemperature(val.toFixed(1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tempVal = parseFloat(temperature);
    if (isNaN(tempVal)) {
      setError('Please enter a valid numeric temperature.');
      return;
    }

    if (tempVal < 34.0 || tempVal > 43.0) {
      setError('Temperature reading must be between 34.0°C and 43.0°C.');
      return;
    }

    setIsSubmitting(true);
    const result = recordTemperature(patient.id, tempVal, notes);

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

  const parsedTemp = parseFloat(temperature) || 0;
  const isFever = parsedTemp >= feverThreshold;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-800 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Thermometer className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Daily Temperature Recording</h3>
              <p className="text-xs text-teal-200 font-medium mt-0.5">
                Official Clinical Thermometry Protocol
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
          {/* Patient Details Card (Read-only) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Patient ID:</span>
                <span className="font-mono font-bold text-slate-800">{patient.patientId}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Patient Name:</span>
                <span className="font-bold text-slate-900">{patient.name}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Room Number:</span>
                <span className="font-bold text-teal-700 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5" /> Room #{patient.roomNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Age & Gender:</span>
                <span className="font-medium text-slate-700">
                  {patient.age} yrs, {patient.gender}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Current Streak:</span>
                <span className="font-bold text-emerald-600">
                  {evaluation?.feverFreeStreak || 0} fever-free days
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Admission Date:</span>
                <span className="font-medium text-slate-700">{patient.admissionDate}</span>
              </div>
            </div>
          </div>

          {/* Already recorded warning */}
          {alreadyRecorded && (
            <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Duplicate Daily Entry Restriction</span>
                A temperature of <strong>{evaluation.todayRecord?.temperature}°C</strong> has already been officially recorded for {patient.name} today ({formatDateTime(evaluation.todayRecord?.recordedAt)}).
                Hospital regulations permit exactly one official temperature recording per patient per calendar day.
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
            {/* Auto Populated Date & Time */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-100/70 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Date: <strong className="text-slate-800">{today}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Time: <strong className="text-slate-800">Now (Auto-stamped)</strong></span>
              </div>
            </div>

            {/* Temperature Value Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Temperature Reading (°C) <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-500">
                  Fever Threshold: <strong className="text-rose-600">≥ {feverThreshold}°C</strong>
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="34.0"
                  max="43.0"
                  disabled={alreadyRecorded || !!successMsg}
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  className={`w-full px-4 py-3 text-2xl font-black text-center rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                    isFever
                      ? 'border-rose-400 bg-rose-50/50 text-rose-700 focus:ring-rose-500'
                      : 'border-slate-300 bg-white text-slate-800 focus:ring-teal-500'
                  } disabled:opacity-50 disabled:bg-slate-100`}
                  placeholder="37.0"
                  required
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg">
                  °C
                </span>
              </div>

              {/* Real-time Triage Status Badge */}
              <div className="mt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`inline-block w-2.5 h-2.5 rounded-full ${
                      isFever ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'
                    }`}
                  />
                  <span className={`font-semibold ${isFever ? 'text-rose-700' : 'text-emerald-700'}`}>
                    {isFever
                      ? `FEVER DETECTED (≥ ${feverThreshold}°C) — Resets streak`
                      : `FEVER-FREE (< ${feverThreshold}°C) — Counts toward discharge`}
                  </span>
                </div>
              </div>

              {/* Quick Select Presets */}
              {!alreadyRecorded && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Quick presets:</span>
                  {[36.6, 37.0, 37.4, 38.2, 38.8].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleQuickTemp(preset)}
                      className={`px-2 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                        preset >= feverThreshold
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {preset}°C
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nurse Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Clinical Observations / Nurse Notes (Optional)
              </label>
              <textarea
                value={notes}
                disabled={alreadyRecorded || !!successMsg}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Patient resting comfortably, mild chills, lungs clear..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>

            {/* Modal Actions */}
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
                disabled={alreadyRecorded || isSubmitting || !!successMsg}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-md shadow-teal-600/20 transition-all"
              >
                <Thermometer className="w-4 h-4" />
                {alreadyRecorded ? 'Already Recorded Today' : 'Save & Confirm Reading'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
