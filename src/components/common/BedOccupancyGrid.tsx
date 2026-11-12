import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Bed, User, ShieldCheck, AlertCircle, Thermometer, ChevronRight, CheckCircle2, Clock } from 'lucide-react';
import { Patient } from '../../types';

interface BedOccupancyGridProps {
  onSelectPatient?: (patient: Patient) => void;
  onSelectEmptyBed?: (roomNumber: number) => void;
  selectedRoomNumber?: number | null;
}

export const BedOccupancyGrid: React.FC<BedOccupancyGridProps> = ({
  onSelectPatient,
  onSelectEmptyBed,
  selectedRoomNumber,
}) => {
  const { totalCapacity, activePatients, evaluations, feverThreshold } = useApp();
  const [filter, setFilter] = useState<'all' | 'occupied' | 'available' | 'fever' | 'discharge'>('all');
  const [hoveredBed, setHoveredBed] = useState<number | null>(null);

  // Map room number to active patient
  const roomMap = new Map<number, Patient>();
  activePatients.forEach((p) => {
    roomMap.set(p.roomNumber, p);
  });

  const beds = Array.from({ length: totalCapacity }, (_, i) => i + 1);

  const getBedStatus = (roomNumber: number) => {
    const patient = roomMap.get(roomNumber);
    if (!patient) return { type: 'available', label: 'Available Bed' };
    const ev = evaluations[patient.id];
    if (ev?.isDischargeEligible) return { type: 'discharge', label: 'Discharge Eligible', patient, ev };
    if (ev?.todayRecord?.hasFever || (ev?.latestTemperature?.temperature || 0) >= feverThreshold) {
      return { type: 'fever', label: 'Active Fever', patient, ev };
    }
    if (!ev?.hasRecordedToday) return { type: 'pending_temp', label: 'Temp Pending', patient, ev };
    return { type: 'stable', label: 'Admitted / Stable', patient, ev };
  };

  const filteredBeds = beds.filter((roomNumber) => {
    const status = getBedStatus(roomNumber);
    if (filter === 'all') return true;
    if (filter === 'available') return status.type === 'available';
    if (filter === 'occupied') return status.type !== 'available';
    if (filter === 'fever') return status.type === 'fever';
    if (filter === 'discharge') return status.type === 'discharge';
    return true;
  });

  const getBedColor = (statusType: string, isSelected: boolean) => {
    const selectedRing = isSelected ? 'ring-3 ring-teal-600 shadow-md scale-[1.02]' : '';
    switch (statusType) {
      case 'available':
        return `bg-emerald-50/80 border-emerald-200 text-emerald-800 hover:bg-emerald-100 hover:border-emerald-300 ${selectedRing}`;
      case 'discharge':
        return `bg-purple-100 border-purple-300 text-purple-900 hover:bg-purple-200 ring-2 ring-purple-400/40 ${selectedRing}`;
      case 'fever':
        return `bg-rose-100 border-rose-300 text-rose-900 hover:bg-rose-200 ring-2 ring-rose-400/30 ${selectedRing}`;
      case 'pending_temp':
        return `bg-amber-100 border-amber-300 text-amber-900 hover:bg-amber-200 ${selectedRing}`;
      case 'stable':
      default:
        return `bg-teal-50 border-teal-200 text-teal-900 hover:bg-teal-100/90 ${selectedRing}`;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs w-full">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-b border-slate-100 gap-4">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2.5">
            <Bed className="w-5 h-5 text-teal-600" />
            Quarantine Ward Occupancy & Bed Control (Rooms 1 – {totalCapacity})
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Real-time isolation layout &bull; Click any bed to inspect clinical vitals or admit an intake patient
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filter === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Beds ({totalCapacity})
          </button>
          <button
            onClick={() => setFilter('occupied')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filter === 'occupied'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
            }`}
          >
            Occupied ({activePatients.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filter === 'available'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Vacant ({totalCapacity - activePatients.length})
          </button>
          <button
            onClick={() => setFilter('fever')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filter === 'fever'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            Active Fever (≥ {feverThreshold}°C)
          </button>
          <button
            onClick={() => setFilter('discharge')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filter === 'discharge'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
            }`}
          >
            Discharge Ready (3+ Days)
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 py-3 text-xs text-slate-600 border-b border-slate-100 mb-5">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-md bg-emerald-100 border border-emerald-300" />
          Vacant & Sanitized
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-md bg-teal-100 border border-teal-300" />
          Occupied & Stable
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-md bg-rose-200 border border-rose-400" />
          Active Fever (≥ {feverThreshold}°C)
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-md bg-amber-200 border border-amber-400" />
          Daily Temp Pending
        </span>
        <span className="flex items-center gap-1.5 font-medium">
          <span className="w-3.5 h-3.5 rounded-md bg-purple-200 border border-purple-400" />
          Discharge Ready (≥3 Fever-Free Days)
        </span>
      </div>

      {/* 74 Beds Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 2xl:grid-cols-10 gap-3">
        {filteredBeds.map((roomNum) => {
          const status = getBedStatus(roomNum);
          const isOccupied = status.type !== 'available';
          const patient = status.patient;
          const isSelected = selectedRoomNumber === roomNum;

          return (
            <div
              key={roomNum}
              onMouseEnter={() => setHoveredBed(roomNum)}
              onMouseLeave={() => setHoveredBed(null)}
              onClick={() => {
                if (isOccupied && patient && onSelectPatient) {
                  onSelectPatient(patient);
                } else if (!isOccupied && onSelectEmptyBed) {
                  onSelectEmptyBed(roomNum);
                }
              }}
              className={`relative rounded-2xl border p-3 cursor-pointer transition-all duration-150 transform hover:-translate-y-1 hover:shadow-md min-h-[92px] flex flex-col justify-between ${getBedColor(
                status.type,
                isSelected
              )}`}
            >
              {/* Top Row: Bed number & Icon */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black tracking-wider uppercase opacity-80">
                  Bed #{roomNum}
                </span>

                <div>
                  {status.type === 'available' ? (
                    <Bed className="w-3.5 h-3.5 text-emerald-600 opacity-60" />
                  ) : status.type === 'discharge' ? (
                    <ShieldCheck className="w-4 h-4 text-purple-700 animate-pulse" />
                  ) : status.type === 'fever' ? (
                    <Thermometer className="w-4 h-4 text-rose-600 animate-bounce" />
                  ) : status.type === 'pending_temp' ? (
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-teal-700" />
                  )}
                </div>
              </div>

              {/* Middle & Bottom: Occupant info or Vacant text */}
              <div className="mt-1.5">
                {isOccupied && patient ? (
                  <div>
                    <div className="text-xs font-black truncate max-w-full">
                      {patient.name}
                    </div>
                    <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
                      <span className="opacity-75">{patient.patientId}</span>
                      <strong className={`font-bold ${status.type === 'fever' ? 'text-rose-700' : 'text-teal-800'}`}>
                        {status.ev?.latestTemperature?.temperature ? `${status.ev.latestTemperature.temperature}°C` : '—'}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-1">
                    <span className="text-[11px] font-extrabold tracking-wide text-emerald-700 block">
                      VACANT
                    </span>
                    <span className="text-[9px] text-emerald-600/80 font-medium">Ready for intake</span>
                  </div>
                )}
              </div>

              {/* Hover Tooltip Card */}
              {hoveredBed === roomNum && isOccupied && patient && (
                <div className="absolute z-40 bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-slate-900 text-white rounded-2xl p-3.5 shadow-2xl text-left pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-700 mb-2">
                    <span className="text-xs font-bold text-teal-300">Isolation Room #{roomNum}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{patient.patientId}</span>
                  </div>
                  <div className="text-xs font-bold text-white truncate">{patient.name}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {patient.age} yrs &bull; {patient.gender}
                  </div>
                  <div className="text-[11px] mt-1 text-slate-300 flex items-center justify-between">
                    <span>Latest Temp:</span>
                    <strong className={status.type === 'fever' ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                      {status.ev?.latestTemperature?.temperature || '—'}°C
                    </strong>
                  </div>
                  <div className="text-[11px] mt-0.5 text-slate-300 flex items-center justify-between">
                    <span>Fever-Free Streak:</span>
                    <strong className="text-teal-400 font-bold">{status.ev?.feverFreeStreak || 0} / 3 days</strong>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-teal-300 font-semibold flex items-center justify-between">
                    <span>Click to open clinical details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
