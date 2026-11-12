import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  HeartPulse,
  Bed,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Award,
} from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

export const AnalyticsReports: React.FC = () => {
  const { patients, activePatients, outcomes, totalCapacity } = useApp();

  // Benchmarks
  const BENCHMARK_MORTALITY_RATE = 15.0; // 15%
  const BENCHMARK_SUCCESS_RATE = 85.0; // 85%

  // Completed outcomes: only historical Recovered or Deceased outcomes.
  // CRITICAL RULE: "Do not count currently admitted patients as completed outcomes."
  const completedOutcomes = useMemo(() => {
    return outcomes.filter((o) => o.outcomeType === 'Recovered' || o.outcomeType === 'Deceased');
  }, [outcomes]);

  const totalDeaths = completedOutcomes.filter((o) => o.outcomeType === 'Deceased').length;
  const totalRecoveries = completedOutcomes.filter((o) => o.outcomeType === 'Recovered').length;
  const totalCompleted = completedOutcomes.length;

  // Formula:
  // Mortality Rate = (Total Deaths / Total Patients with Completed Outcomes) × 100
  // Success Rate = (Total Recoveries / Total Patients with Completed Outcomes) × 100
  const actualMortalityRate = totalCompleted > 0 ? (totalDeaths / totalCompleted) * 100 : 0;
  const actualSuccessRate = totalCompleted > 0 ? (totalRecoveries / totalCompleted) * 100 : 0;

  // Visual alerts if exceeding mortality benchmark or below success benchmark
  const isMortalityExceeded = actualMortalityRate > BENCHMARK_MORTALITY_RATE;
  const isSuccessUnderperforming = actualSuccessRate < BENCHMARK_SUCCESS_RATE;

  // Benchmark comparison dataset for Recharts
  const benchmarkComparisonData = [
    {
      metric: 'Treatment Success Rate (%)',
      Actual: Number(actualSuccessRate.toFixed(1)),
      Benchmark: BENCHMARK_SUCCESS_RATE,
    },
    {
      metric: 'Mortality Rate (%)',
      Actual: Number(actualMortalityRate.toFixed(1)),
      Benchmark: BENCHMARK_MORTALITY_RATE,
    },
  ];

  // Outcome distribution data for Pie Chart
  const outcomeDistributionData = [
    { name: 'Recovered (Discharged)', value: totalRecoveries, color: '#10b981' },
    { name: 'Deceased', value: totalDeaths, color: '#ef4444' },
  ];

  // Stay duration analysis
  const avgStayDuration = useMemo(() => {
    if (totalRecoveries === 0) return 0;
    const totalDays = completedOutcomes
      .filter((o) => o.outcomeType === 'Recovered')
      .reduce((acc, curr) => acc + curr.daysInQuarantine, 0);
    return (totalDays / totalRecoveries).toFixed(1);
  }, [completedOutcomes, totalRecoveries]);

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-teal-600" />
            Epidemiological Analytics & Benchmark Compliance
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized virus mortality monitoring against the 15% ceiling and 85% recovery benchmark
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
          <Target className="w-4 h-4 text-teal-600" />
          <span>Completed Outcomes: <strong>{totalCompleted} cases</strong></span>
        </div>
      </div>

      {/* Benchmark Alert Banners */}
      {isMortalityExceeded && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          <div>
            <strong className="font-bold text-rose-800 block text-sm">
              Mortality Alert: Current Rate ({actualMortalityRate.toFixed(1)}%) Exceeds Expected Benchmark ({BENCHMARK_MORTALITY_RATE}%)
            </strong>
            Facility protocol advises clinical review of therapeutic regimens and secondary bacterial prophylaxis.
          </div>
        </div>
      )}

      {/* Top 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Treatment Success Rate */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Treatment Success Rate
            </span>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">
              {actualSuccessRate.toFixed(1)}%
            </span>
            <span className="text-xs font-bold text-slate-400">
              Target: {BENCHMARK_SUCCESS_RATE}%
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            {actualSuccessRate >= BENCHMARK_SUCCESS_RATE ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                <ArrowUpRight className="w-3.5 h-3.5" /> Meeting Target (+{(actualSuccessRate - BENCHMARK_SUCCESS_RATE).toFixed(1)}%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                <ArrowDownRight className="w-3.5 h-3.5" /> Under Target ({(actualSuccessRate - BENCHMARK_SUCCESS_RATE).toFixed(1)}%)
              </span>
            )}
          </div>
        </div>

        {/* KPI 2: Mortality Rate */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Actual Mortality Rate
            </span>
            <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
              <HeartPulse className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span
              className={`text-3xl font-black ${
                isMortalityExceeded ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {actualMortalityRate.toFixed(1)}%
            </span>
            <span className="text-xs font-bold text-slate-400">
              Benchmark: &le; {BENCHMARK_MORTALITY_RATE}%
            </span>
          </div>
          <div className="mt-2.5 flex items-center gap-1.5 text-xs">
            {actualMortalityRate <= BENCHMARK_MORTALITY_RATE ? (
              <span className="inline-flex items-center gap-0.5 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3.5 h-3.5" /> Under Ceiling Threshold
              </span>
            ) : (
              <span className="inline-flex items-center gap-0.5 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                <AlertTriangle className="w-3.5 h-3.5" /> Exceeds Benchmark
              </span>
            )}
          </div>
        </div>

        {/* KPI 3: Recovered vs Deaths */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Completed Outcomes
            </span>
            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-slate-900">{totalCompleted}</span>
            <span className="text-xs text-slate-500 font-semibold">Total Resolved</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <span className="text-emerald-700 font-bold">{totalRecoveries} Recoveries</span>
            <span>&bull;</span>
            <span className="text-rose-700 font-bold">{totalDeaths} Deaths</span>
          </div>
        </div>

        {/* KPI 4: Mean Stay Duration */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mean Quarantine Stay
            </span>
            <div className="p-2 bg-teal-50 rounded-xl text-teal-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-black text-teal-700">{avgStayDuration}</span>
            <span className="text-xs text-slate-500 font-semibold">Days to full clearance</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Current Active Patients: <strong className="text-slate-800">{activePatients.length} admitted</strong>
          </div>
        </div>
      </div>

      {/* Main Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Chart 1: Actual vs Benchmark Bar Chart */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                Actual Facility Rates vs Benchmark Standard
              </h3>
              <p className="text-xs text-slate-500">
                Comparing QuarantineCare clinical performance directly against expected viral benchmarks
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={benchmarkComparisonData}
                margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="metric" tick={{ fontSize: 12, fontWeight: 600 }} />
                <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, '']}
                  contentStyle={{ borderRadius: 12, backgroundColor: '#0f172a', color: '#fff', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                <Bar dataKey="Actual" fill="#0d9488" radius={[8, 8, 0, 0]} barSize={40} />
                <Bar dataKey="Benchmark" fill="#94a3b8" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <Target className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <strong>Calculation Standard:</strong> Currently admitted patients ({activePatients.length}) are strictly excluded from completed outcomes until final discharge or clinical resolution, ensuring mathematical accuracy.
            </div>
          </div>
        </div>

        {/* Chart 2: Outcome Distribution Pie Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Completed Outcomes Ratio</h3>
              <p className="text-xs text-slate-500">Breakdown of all resolved quarantine cases</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={outcomeDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {outcomeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [val, 'Patients']}
                  contentStyle={{ borderRadius: 12, backgroundColor: '#0f172a', color: '#fff', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">
                Recoveries
              </span>
              <span className="text-lg font-black text-emerald-800">{totalRecoveries}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200">
              <span className="text-[10px] text-rose-700 font-bold uppercase block">
                Mortalities
              </span>
              <span className="text-lg font-black text-rose-800">{totalDeaths}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Historical Outcomes Detailed Log */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Completed Outcomes Registry (Sample Size: {totalCompleted})
            </h3>
            <p className="text-xs text-slate-500">
              Every verified resolution used for calculating facility epidemiological statistics
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Case ID</th>
                <th className="py-3 px-4">Patient Name</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Admission</th>
                <th className="py-3 px-4">Outcome Date</th>
                <th className="py-3 px-4">Total Stay</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Clinical Case Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {completedOutcomes.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700">
                    {item.patientDisplayId}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{item.patientName}</td>
                  <td className="py-3 px-4 text-slate-600">
                    {item.age}y &bull; {item.gender}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{formatDate(item.admissionDate)}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{formatDate(item.outcomeDate)}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{item.daysInQuarantine} days</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.outcomeType === 'Recovered'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-100 text-rose-800 border border-rose-200'
                      }`}
                    >
                      {item.outcomeType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 max-w-sm truncate">{item.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
