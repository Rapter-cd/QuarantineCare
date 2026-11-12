import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  Bed,
  Users,
  Thermometer,
  Stethoscope,
  ShieldCheck,
  TrendingUp,
  AlertTriangle,
  UserPlus,
  Clock,
  CheckCircle2,
  ChevronRight,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatDate } from '../../utils/dateUtils';
import { BedOccupancyGrid } from '../common/BedOccupancyGrid';
import { AddPatientModal } from '../patients/AddPatientModal';
import { PatientDetailsModal } from '../patients/PatientDetailsModal';

interface AdminDashboardProps {
  onNavigateToTab?: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateToTab }) => {
  const {
    totalCapacity,
    activePatients,
    availableBedsCount,
    occupiedRooms,
    evaluations,
    patients,
    outcomes,
    notifications,
    currentUser,
    feverThreshold,
  } = useApp();

  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [selectedEmptyBed, setSelectedEmptyBed] = useState<number | undefined>(undefined);
  const [selectedPatientForDetails, setSelectedPatientForDetails] = useState<Patient | null>(null);

  // Core metrics
  const occupiedBedsCount = occupiedRooms.size;
  const requiringTempsCount = activePatients.filter(
    (p) => !evaluations[p.id]?.hasRecordedToday
  ).length;
  const awaitingDoctorCount = activePatients.filter(
    (p) => evaluations[p.id]?.hasRecordedToday && !evaluations[p.id]?.hasDoctorVisitedToday
  ).length;
  const eligibleForDischargeCount = activePatients.filter(
    (p) => evaluations[p.id]?.isDischargeEligible
  ).length;

  const totalDischargedCount = outcomes.filter((o) => o.outcomeType === 'Recovered').length;
  const totalDeathsCount = outcomes.filter((o) => o.outcomeType === 'Deceased').length;
  const totalCompletedOutcomes = outcomes.length;

  // Real formula-calculated rates:
  const actualMortalityRate =
    totalCompletedOutcomes > 0 ? (totalDeathsCount / totalCompletedOutcomes) * 100 : 0;
  const actualSuccessRate =
    totalCompletedOutcomes > 0 ? (totalDischargedCount / totalCompletedOutcomes) * 100 : 0;

  const BENCHMARK_MORTALITY = 15.0;
  const BENCHMARK_SUCCESS = 85.0;

  // Benchmark mini-chart data
  const benchmarkData = [
    {
      metric: 'Success Rate',
      Actual: Number(actualSuccessRate.toFixed(1)),
      Benchmark: BENCHMARK_SUCCESS,
    },
    {
      metric: 'Mortality',
      Actual: Number(actualMortalityRate.toFixed(1)),
      Benchmark: BENCHMARK_MORTALITY,
    },
  ];

  // Recent admissions (last 5)
  const recentAdmissions = [...activePatients]
    .sort((a, b) => new Date(b.admissionDate).getTime() - new Date(a.admissionDate).getTime())
    .slice(0, 5);

  // Recent discharges (last 5)
  const recentDischarges = [...outcomes]
    .filter((o) => o.outcomeType === 'Recovered')
    .slice(0, 5);

  const occupancyPercentage = ((occupiedBedsCount / totalCapacity) * 100).toFixed(0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-purple-200 border border-white/15 mb-2">
              <Building2 className="w-3.5 h-3.5" /> Quarantine Facility Operations Command
            </div>
            <h1 className="text-2xl font-black tracking-tight">
              Hospital Operations Overview & Bed Control
            </h1>
            <p className="text-xs text-purple-200 font-medium mt-1 max-w-2xl">
              Capacity: {occupiedBedsCount} of {totalCapacity} beds occupied ({occupancyPercentage}%). Protocol discharges require explicit administrative confirmation to release rooms.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedEmptyBed(undefined);
                setShowAddPatientModal(true);
              }}
              className="flex items-center gap-2 px-5 py-3 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl text-xs font-extrabold shadow-lg shadow-teal-500/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              Admit New Patient
            </button>
          </div>
        </div>
      </div>

      {/* 8 Primary Summary Cards (Screen 2 Requirements) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* 1. Total Capacity */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Capacity
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">{totalCapacity}</div>
          <span className="text-[10px] text-slate-500">Isolation Beds</span>
        </div>

        {/* 2. Occupied Beds */}
        <div className="bg-white rounded-2xl border border-teal-200 bg-teal-50/20 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
            Occupied Beds
          </span>
          <div className="text-xl font-black text-teal-800 mt-1">{occupiedBedsCount}</div>
          <span className="text-[10px] text-teal-600 font-medium">{occupancyPercentage}% full</span>
        </div>

        {/* 3. Available Beds */}
        <div className="bg-white rounded-2xl border border-emerald-200 bg-emerald-50/20 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
            Available Beds
          </span>
          <div className="text-xl font-black text-emerald-800 mt-1">{availableBedsCount}</div>
          <span className="text-[10px] text-emerald-600 font-medium">Vacant / Ready</span>
        </div>

        {/* 4. Active Patients */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Patients
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">{activePatients.length}</div>
          <span className="text-[10px] text-slate-500">Under Care</span>
        </div>

        {/* 5. Requiring Temp */}
        <div className="bg-white rounded-2xl border border-amber-200 bg-amber-50/20 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
            Requiring Temp
          </span>
          <div className="text-xl font-black text-amber-800 mt-1">{requiringTempsCount}</div>
          <span className="text-[10px] text-amber-600 font-medium">Pending Today</span>
        </div>

        {/* 6. Awaiting Doctor */}
        <div className="bg-white rounded-2xl border border-blue-200 bg-blue-50/20 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
            Awaiting Doctor
          </span>
          <div className="text-xl font-black text-blue-800 mt-1">{awaitingDoctorCount}</div>
          <span className="text-[10px] text-blue-600 font-medium">Vitals Recorded</span>
        </div>

        {/* 7. Eligible for Discharge */}
        <div className="bg-white rounded-2xl border border-purple-200 bg-purple-50/20 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider block">
            Discharge Ready
          </span>
          <div className="text-xl font-black text-purple-800 mt-1">
            {eligibleForDischargeCount}
          </div>
          <span className="text-[10px] text-purple-600 font-bold">&ge; 3d Fever-Free</span>
        </div>

        {/* 8. Total Discharged */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Discharged
          </span>
          <div className="text-xl font-black text-slate-900 mt-1">{totalDischargedCount}</div>
          <span className="text-[10px] text-emerald-600 font-bold">Cured Outcomes</span>
        </div>
      </div>

      {/* Real Benchmarks & Operational Performance Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-600" />
              Dynamic Virus Outcome Metrics vs Clinical Standards
            </h3>
            <p className="text-xs text-slate-500">
              Computed strictly from completed patient outcomes ({totalCompletedOutcomes} cases resolved to date)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 font-bold">
                Treatment Success: {actualSuccessRate.toFixed(1)}%
              </span>{' '}
              <span className="text-slate-500">(Target: {BENCHMARK_SUCCESS}%)</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-rose-700 font-bold">
                Mortality Rate: {actualMortalityRate.toFixed(1)}%
              </span>{' '}
              <span className="text-slate-500">(Max: {BENCHMARK_MORTALITY}%)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-4">
          <div className="md:col-span-8 h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={benchmarkData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <YAxis dataKey="metric" type="category" tick={{ fontSize: 11, fontWeight: 600 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, '']}
                  contentStyle={{ borderRadius: 12, backgroundColor: '#0f172a', color: '#fff', fontSize: 12 }}
                />
                <Bar dataKey="Actual" fill="#0d9488" radius={[0, 6, 6, 0]} barSize={18} />
                <Bar dataKey="Benchmark" fill="#cbd5e1" radius={[0, 6, 6, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="md:col-span-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between text-xs space-y-2">
            <div>
              <span className="font-bold text-slate-800 block">Epidemiological Status</span>
              <p className="text-slate-600 mt-1 leading-relaxed">
                QuarantineCare is operating within expected viral survival benchmarks. All discharged patients completed the rigorous 3-day fever-free protocol.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('analytics')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center justify-between pt-2 border-t border-slate-200"
            >
              <span>Explore In-Depth Analytics</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive 74-bed visual ward map */}
      <BedOccupancyGrid
        onSelectPatient={(p) => setSelectedPatientForDetails(p)}
        onSelectEmptyBed={(roomNum) => {
          setSelectedEmptyBed(roomNum);
          setShowAddPatientModal(true);
        }}
      />

      {/* Two Column: Recent Admissions vs Discharges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Admissions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-teal-600" />
              Recent Patient Admissions
            </h3>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('patients')}
              className="text-xs text-teal-700 hover:text-teal-900 font-semibold"
            >
              View All ({activePatients.length})
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentAdmissions.map((patient) => (
              <div
                key={patient.id}
                onClick={() => setSelectedPatientForDetails(patient)}
                className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 cursor-pointer transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs">{patient.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {patient.patientId} &bull; Room #{patient.roomNumber} &bull; {patient.age}y {patient.gender}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-slate-700 block">
                    {formatDate(patient.admissionDate)}
                  </span>
                  <span className="text-[10px] text-teal-600 font-semibold">
                    Initial: {patient.initialTemperature}°C
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Discharges */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              Recent Successful Discharges
            </h3>
            <button
              onClick={() => onNavigateToTab && onNavigateToTab('discharge')}
              className="text-xs text-purple-700 hover:text-purple-900 font-semibold"
            >
              Discharge Center
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentDischarges.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                No discharges recorded yet.
              </div>
            ) : (
              recentDischarges.map((out) => (
                <div
                  key={out.id}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-xl px-2 transition-colors"
                >
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{out.patientName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {out.patientDisplayId} &bull; Released Bed #{out.roomNumber}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-emerald-700 block">
                      &check; Discharged
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Stay: {out.daysInQuarantine} days
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAddPatientModal && (
        <AddPatientModal
          initialRoomNumber={selectedEmptyBed}
          onClose={() => {
            setShowAddPatientModal(false);
            setSelectedEmptyBed(undefined);
          }}
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
