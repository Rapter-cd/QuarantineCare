import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  UserPlus,
  X,
  AlertTriangle,
  CheckCircle2,
  Bed,
  Thermometer,
  Calendar,
  Phone,
  User,
  Hash,
} from 'lucide-react';
import { getTodayDateString } from '../../utils/dateUtils';

interface AddPatientModalProps {
  initialRoomNumber?: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  initialRoomNumber,
  onClose,
  onSuccess,
}) => {
  const { registerPatient, occupiedRooms, totalCapacity, feverThreshold } = useApp();

  // Find first vacant room
  const defaultRoom =
    initialRoomNumber && !occupiedRooms.has(initialRoomNumber)
      ? initialRoomNumber
      : Array.from({ length: totalCapacity }, (_, i) => i + 1).find(
          (r) => !occupiedRooms.has(r)
        ) || 1;

  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('35');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [roomNumber, setRoomNumber] = useState<number>(defaultRoom);
  const [contactDetails, setContactDetails] = useState('');
  const [initialTemp, setInitialTemp] = useState<string>('38.5');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available room numbers list
  const availableRooms = Array.from({ length: totalCapacity }, (_, i) => i + 1).filter(
    (r) => !occupiedRooms.has(r)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Patient full name is required.');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 125) {
      setError('Please provide a valid age between 0 and 125.');
      return;
    }

    const tempNum = parseFloat(initialTemp);
    if (isNaN(tempNum) || tempNum < 34.0 || tempNum > 43.0) {
      setError('Initial admission temperature must be between 34.0°C and 43.0°C.');
      return;
    }

    if (occupiedRooms.has(roomNumber)) {
      setError(`Room ${roomNumber} is currently occupied! Please select a vacant room.`);
      return;
    }

    setIsSubmitting(true);
    const result = registerPatient({
      name: name.trim(),
      age: ageNum,
      gender,
      roomNumber,
      contactDetails: contactDetails.trim() || undefined,
      initialTemperature: tempNum,
      notes: notes.trim() || undefined,
    });

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
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-teal-900 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <UserPlus className="w-6 h-6 text-teal-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">Quarantine Patient Intake</h3>
              <p className="text-xs text-teal-200 font-medium mt-0.5">
                Register New Patient & Assign Isolation Bed (1 - {totalCapacity})
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
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Age and Gender */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Age <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  max="125"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Gender <span className="text-rose-500">*</span>
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Room Assignment (Only 1 to 74, prevent occupied) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Room Assignment <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-teal-700 font-semibold">
                  {availableRooms.length} of {totalCapacity} rooms available
                </span>
              </div>
              <div className="relative">
                <select
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(parseInt(e.target.value, 10))}
                  className="w-full pl-9 pr-3 py-2.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {availableRooms.length === 0 ? (
                    <option value="" disabled>
                      Facility At Max Capacity (74/74 beds full)
                    </option>
                  ) : (
                    availableRooms.map((r) => (
                      <option key={r} value={r}>
                        Room #{r} (Vacant & Sanitized)
                      </option>
                    ))
                  )}
                </select>
                <Bed className="w-4 h-4 text-teal-600 absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Initial Temperature & Contact */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Initial Temp (°C) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="34.0"
                    max="43.0"
                    required
                    value={initialTemp}
                    onChange={(e) => setInitialTemp(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Thermometer className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {parseFloat(initialTemp) >= feverThreshold ? (
                    <span className="text-rose-600 font-semibold">Active Fever (≥ {feverThreshold}°C)</span>
                  ) : (
                    <span className="text-emerald-600 font-semibold">Normal baseline</span>
                  )}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Contact Phone (Optional)
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={contactDetails}
                    onChange={(e) => setContactDetails(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full pl-9 pr-3 py-2.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>
              </div>
            </div>

            {/* Admission Date & ID Info */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Admission Date: <strong>Today ({getTodayDateString()})</strong></span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                <Hash className="w-3 h-3" />
                <span>Auto-ID: QC-2026-XXXX</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5">
                Clinical Intake Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Symptoms onset, travel history, known viral exposure, comorbidities..."
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
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
                disabled={isSubmitting || availableRooms.length === 0 || !!successMsg}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-xl shadow-md shadow-teal-600/20 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                Admit Patient & Assign Room #{roomNumber}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
