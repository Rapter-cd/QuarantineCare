export type UserRole = 'nurse' | 'doctor' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  avatar?: string;
}

export type PatientStatus = 'Admitted' | 'Discharged' | 'Deceased';

export interface Patient {
  id: string;
  patientId: string; // e.g., QC-2026-0012
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  roomNumber: number; // 1 to 74
  admissionDate: string; // YYYY-MM-DD
  contactDetails?: string;
  initialTemperature: number;
  status: PatientStatus;
  dischargeDate?: string;
  notes?: string;
  underlyingConditions?: string[];
}

export interface TemperatureRecord {
  id: string;
  patientId: string;
  temperature: number; // in Celsius
  recordedAt: string; // ISO string e.g. 2026-11-12T08:30:00Z
  dateOnly: string; // YYYY-MM-DD
  recordedBy: string; // Nurse Name
  recordedById?: string;
  notes?: string;
  hasFever: boolean; // >= feverThreshold (38.0°C)
}

export type TreatmentDecision =
  | 'Continue Standard Protocol'
  | 'Prescribe Antiviral & Antipyretic'
  | 'Order Chest X-Ray & Blood Panel'
  | 'Recommend Discharge Review'
  | 'Transfer to Intensive Monitoring'
  | 'Hydration & Supportive Care';

export interface DoctorVisit {
  id: string;
  patientId: string;
  visitDate: string; // YYYY-MM-DD
  visitedAt: string; // ISO string
  doctorId: string;
  doctorName: string;
  treatmentDecision: TreatmentDecision;
  clinicalNotes: string;
  observations?: string;
  recommendedDischarge?: boolean;
}

export type NotificationType =
  | 'discharge_eligible'
  | 'fever_alert'
  | 'visit_pending'
  | 'temperature_overdue'
  | 'admission_created'
  | 'patient_discharged';

export interface AppNotification {
  id: string;
  recipientRole: 'all' | UserRole;
  type: NotificationType;
  title: string;
  message: string;
  patientId?: string;
  patientName?: string;
  roomNumber?: number;
  createdAt: string;
  isRead: boolean;
}

export interface PatientOutcome {
  id: string;
  patientId: string;
  patientDisplayId: string;
  patientName: string;
  age: number;
  gender: string;
  roomNumber: number;
  admissionDate: string;
  outcomeDate: string;
  outcomeType: 'Recovered' | 'Deceased';
  daysInQuarantine: number;
  notes?: string;
}

export interface PatientDailyEvaluation {
  patient: Patient;
  hasRecordedToday: boolean;
  todayRecord?: TemperatureRecord;
  hasDoctorVisitedToday: boolean;
  todayVisit?: DoctorVisit;
  feverFreeStreak: number; // consecutive full days fever free
  isDischargeEligible: boolean;
  latestTemperature?: TemperatureRecord;
  trend: 'improving' | 'stable' | 'deteriorating' | 'fever';
  isOverdueTemp: boolean; // admitted, not recorded today, and it's past typical morning rounds
}
