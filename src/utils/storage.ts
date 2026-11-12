import {
  Patient,
  TemperatureRecord,
  DoctorVisit,
  AppNotification,
  PatientOutcome,
  User,
  PatientDailyEvaluation,
} from '../types';
import { getTodayDateString, subtractDays } from './dateUtils';

export const TOTAL_CAPACITY = 74;
export const DEFAULT_FEVER_THRESHOLD = 38.0; // in °C

export const DEMO_USERS: User[] = [
  {
    id: 'user-nurse-1',
    name: 'Nurse Clara Oswald',
    email: 'nurse@quarantinecare.com',
    role: 'nurse',
    title: 'Lead Quarantine Nurse',
    department: 'Triage & Vital Signs',
    avatar: 'https://images.unsplash.com/photo-1594824813628-09ee86503b41?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-doctor-1',
    name: 'Dr. Gregory Mercer, MD',
    email: 'doctor@quarantinecare.com',
    role: 'doctor',
    title: 'Senior Infectious Disease Specialist',
    department: 'Viral Therapeutics Unit',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'user-admin-1',
    name: 'Director Arthur Vance',
    email: 'admin@quarantinecare.com',
    role: 'admin',
    title: 'Facility Operations Director',
    department: 'Hospital Administration & Bed Control',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
];

const STORAGE_KEYS = {
  CURRENT_USER: 'qc_current_user',
  PATIENTS: 'qc_patients',
  TEMPERATURE_RECORDS: 'qc_temperature_records',
  DOCTOR_VISITS: 'qc_doctor_visits',
  NOTIFICATIONS: 'qc_notifications',
  OUTCOMES: 'qc_outcomes',
  FEVER_THRESHOLD: 'qc_fever_threshold',
  LAST_SEEDED: 'qc_last_seeded_date',
};

// Initial generator relative to current date
function generateInitialData() {
  const today = getTodayDateString();
  const d1 = subtractDays(today, 1);
  const d2 = subtractDays(today, 2);
  const d3 = subtractDays(today, 3);
  const d4 = subtractDays(today, 4);
  const d5 = subtractDays(today, 5);
  const d6 = subtractDays(today, 6);
  const d7 = subtractDays(today, 7);
  const d10 = subtractDays(today, 10);
  const d12 = subtractDays(today, 12);
  const d14 = subtractDays(today, 14);

  const initialPatients: Patient[] = [
    {
      id: 'p-1',
      patientId: 'QC-2026-0012',
      name: 'Eleanor Vance',
      age: 42,
      gender: 'Female',
      roomNumber: 12,
      admissionDate: d6,
      contactDetails: '+1 (555) 234-5678',
      initialTemperature: 39.2,
      status: 'Admitted',
      notes: 'Patient admitted with viral fever and persistent cough. Showing rapid clearance.',
      underlyingConditions: ['Asthma'],
    },
    {
      id: 'p-2',
      patientId: 'QC-2026-0018',
      name: 'Marcus Brody',
      age: 58,
      gender: 'Male',
      roomNumber: 18,
      admissionDate: d5,
      contactDetails: '+1 (555) 876-5432',
      initialTemperature: 38.9,
      status: 'Admitted',
      notes: 'Third consecutive fever-free day recorded today. Ready for discharge evaluation.',
      underlyingConditions: ['Hypertension'],
    },
    {
      id: 'p-3',
      patientId: 'QC-2026-0005',
      name: 'Sophia Chen',
      age: 29,
      gender: 'Female',
      roomNumber: 5,
      admissionDate: d4,
      contactDetails: '+1 (555) 345-6789',
      initialTemperature: 38.8,
      status: 'Admitted',
      notes: 'Morning temperature measurement pending today.',
    },
    {
      id: 'p-4',
      patientId: 'QC-2026-0023',
      name: 'David O\'Connor',
      age: 64,
      gender: 'Male',
      roomNumber: 23,
      admissionDate: d3,
      contactDetails: '+1 (555) 456-7890',
      initialTemperature: 39.4,
      status: 'Admitted',
      notes: 'Persistent high fever spike observed today. Requires antiviral review.',
      underlyingConditions: ['Type 2 Diabetes'],
    },
    {
      id: 'p-5',
      patientId: 'QC-2026-0031',
      name: 'Amara Diallo',
      age: 34,
      gender: 'Female',
      roomNumber: 31,
      admissionDate: d7,
      contactDetails: '+1 (555) 567-8901',
      initialTemperature: 38.7,
      status: 'Admitted',
      notes: 'Clinically stable. Completed 3 fever-free days today.',
    },
    {
      id: 'p-6',
      patientId: 'QC-2026-0044',
      name: 'Lucas Silva',
      age: 51,
      gender: 'Male',
      roomNumber: 44,
      admissionDate: d2,
      contactDetails: '+1 (555) 678-9012',
      initialTemperature: 38.6,
      status: 'Admitted',
      notes: 'Fever breaking today at 37.4°C. Doctor completed morning evaluation.',
    },
    {
      id: 'p-7',
      patientId: 'QC-2026-0002',
      name: 'Hanna Lindqvist',
      age: 73,
      gender: 'Female',
      roomNumber: 2,
      admissionDate: d1,
      contactDetails: '+1 (555) 789-0123',
      initialTemperature: 39.1,
      status: 'Admitted',
      notes: 'High risk demographic. Morning temperature overdue.',
    },
    {
      id: 'p-8',
      patientId: 'QC-2026-0062',
      name: 'Tariq Al-Mansoor',
      age: 47,
      gender: 'Male',
      roomNumber: 62,
      admissionDate: d5,
      contactDetails: '+1 (555) 890-1234',
      initialTemperature: 38.5,
      status: 'Admitted',
      notes: 'Temp recorded today at 37.0°C. Awaiting doctor consultation.',
    },
    {
      id: 'p-9',
      patientId: 'QC-2026-0015',
      name: 'Elena Rostova',
      age: 38,
      gender: 'Female',
      roomNumber: 15,
      admissionDate: d4,
      contactDetails: '+1 (555) 901-2345',
      initialTemperature: 38.9,
      status: 'Admitted',
      notes: 'Had missed measurement yesterday. Streak reset demonstration.',
    },
    {
      id: 'p-10',
      patientId: 'QC-2026-0071',
      name: 'Kwame Asante',
      age: 60,
      gender: 'Male',
      roomNumber: 71,
      admissionDate: d6,
      contactDetails: '+1 (555) 012-3456',
      initialTemperature: 38.8,
      status: 'Admitted',
      notes: 'Pending nurse vital sign check for today.',
    },
    {
      id: 'p-11',
      patientId: 'QC-2026-0009',
      name: 'Clara Morales',
      age: 27,
      gender: 'Female',
      roomNumber: 9,
      admissionDate: d3,
      contactDetails: '+1 (555) 123-4567',
      initialTemperature: 39.0,
      status: 'Admitted',
      notes: 'Moderate viral symptoms, fever fluctuating around 38.3°C.',
    },
    {
      id: 'p-12',
      patientId: 'QC-2026-0055',
      name: 'Arthur Pendelton',
      age: 81,
      gender: 'Male',
      roomNumber: 55,
      admissionDate: d7,
      contactDetails: '+1 (555) 234-9876',
      initialTemperature: 38.7,
      status: 'Admitted',
      notes: 'Excellent recovery progression. 4 consecutive fever free days.',
    },
  ];

  const initialTemperatures: TemperatureRecord[] = [
    // p-1: Eleanor Vance (Eligible for discharge - 4 fever free days including today)
    { id: 't-1-3', patientId: 'p-1', temperature: 36.6, dateOnly: d3, recordedAt: `${d3}T08:15:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-1-2', patientId: 'p-1', temperature: 36.8, dateOnly: d2, recordedAt: `${d2}T08:20:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-1-1', patientId: 'p-1', temperature: 36.7, dateOnly: d1, recordedAt: `${d1}T08:10:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-1-0', patientId: 'p-1', temperature: 36.6, dateOnly: today, recordedAt: `${today}T08:05:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false, notes: 'Patient feeling energetic and clear.' },

    // p-2: Marcus Brody (Eligible for discharge - Day 1: d2 37.1, Day 2: d1 36.9, Day 3: today 36.8)
    { id: 't-2-3', patientId: 'p-2', temperature: 38.4, dateOnly: d3, recordedAt: `${d3}T08:30:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true, notes: 'Fever spike evening prior.' },
    { id: 't-2-2', patientId: 'p-2', temperature: 37.1, dateOnly: d2, recordedAt: `${d2}T08:25:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-2-1', patientId: 'p-2', temperature: 36.9, dateOnly: d1, recordedAt: `${d1}T08:30:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-2-0', patientId: 'p-2', temperature: 36.8, dateOnly: today, recordedAt: `${today}T08:15:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false, notes: 'Completed 3 full fever-free days!' },

    // p-3: Sophia Chen (Pending temperature today)
    { id: 't-3-2', patientId: 'p-3', temperature: 38.9, dateOnly: d2, recordedAt: `${d2}T08:45:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true },
    { id: 't-3-1', patientId: 'p-3', temperature: 37.2, dateOnly: d1, recordedAt: `${d1}T08:40:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    // no reading today -> pending!

    // p-4: David O'Connor (High Fever today, recorded, needs doctor visit)
    { id: 't-4-2', patientId: 'p-4', temperature: 38.7, dateOnly: d2, recordedAt: `${d2}T09:00:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true },
    { id: 't-4-1', patientId: 'p-4', temperature: 38.6, dateOnly: d1, recordedAt: `${d1}T08:50:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true },
    { id: 't-4-0', patientId: 'p-4', temperature: 38.9, dateOnly: today, recordedAt: `${today}T08:25:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true, notes: 'Chills and body aches reported.' },

    // p-5: Amara Diallo (3 days fever free)
    { id: 't-5-2', patientId: 'p-5', temperature: 37.0, dateOnly: d2, recordedAt: `${d2}T09:10:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-5-1', patientId: 'p-5', temperature: 36.9, dateOnly: d1, recordedAt: `${d1}T09:05:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-5-0', patientId: 'p-5', temperature: 36.7, dateOnly: today, recordedAt: `${today}T08:35:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false, notes: 'Normal vitals across the board.' },

    // p-6: Lucas Silva (recorded today, visited today)
    { id: 't-6-1', patientId: 'p-6', temperature: 38.2, dateOnly: d1, recordedAt: `${d1}T09:15:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true },
    { id: 't-6-0', patientId: 'p-6', temperature: 37.4, dateOnly: today, recordedAt: `${today}T08:40:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false, notes: 'Fever broke overnight.' },

    // p-7: Hanna Lindqvist (overdue today)
    { id: 't-7-1', patientId: 'p-7', temperature: 38.8, dateOnly: d1, recordedAt: `${d1}T09:30:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true },

    // p-8: Tariq Al-Mansoor (recorded today, awaiting doctor)
    { id: 't-8-2', patientId: 'p-8', temperature: 37.2, dateOnly: d2, recordedAt: `${d2}T09:40:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-8-1', patientId: 'p-8', temperature: 37.1, dateOnly: d1, recordedAt: `${d1}T09:35:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-8-0', patientId: 'p-8', temperature: 37.0, dateOnly: today, recordedAt: `${today}T08:45:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },

    // p-9: Elena Rostova (Demonstrates missing day doesn't count as fever free)
    { id: 't-9-2', patientId: 'p-9', temperature: 38.5, dateOnly: d2, recordedAt: `${d2}T10:00:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true },
    // d1 was missed!
    { id: 't-9-0', patientId: 'p-9', temperature: 36.8, dateOnly: today, recordedAt: `${today}T08:50:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false, notes: 'Missed measurement yesterday; fever-free streak count is 1.' },

    // p-10: Kwame Asante (pending today)
    { id: 't-10-2', patientId: 'p-10', temperature: 37.3, dateOnly: d2, recordedAt: `${d2}T10:15:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-10-1', patientId: 'p-10', temperature: 36.9, dateOnly: d1, recordedAt: `${d1}T10:00:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },

    // p-11: Clara Morales (fever today)
    { id: 't-11-2', patientId: 'p-11', temperature: 38.8, dateOnly: d2, recordedAt: `${d2}T10:30:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true },
    { id: 't-11-1', patientId: 'p-11', temperature: 38.5, dateOnly: d1, recordedAt: `${d1}T10:20:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true },
    { id: 't-11-0', patientId: 'p-11', temperature: 38.3, dateOnly: today, recordedAt: `${today}T08:55:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: true },

    // p-12: Arthur Pendelton (Eligible for discharge - 4 consecutive days fever free)
    { id: 't-12-3', patientId: 'p-12', temperature: 37.0, dateOnly: d3, recordedAt: `${d3}T10:45:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-12-2', patientId: 'p-12', temperature: 36.8, dateOnly: d2, recordedAt: `${d2}T10:40:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-12-1', patientId: 'p-12', temperature: 36.7, dateOnly: d1, recordedAt: `${d1}T10:30:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false },
    { id: 't-12-0', patientId: 'p-12', temperature: 36.6, dateOnly: today, recordedAt: `${today}T09:00:00Z`, recordedBy: 'Nurse Clara Oswald', hasFever: false, notes: 'Patient feeling completely restored.' },
  ];

  const initialVisits: DoctorVisit[] = [
    // p-1: Eleanor Vance visited today
    {
      id: 'v-1-0',
      patientId: 'p-1',
      visitDate: today,
      visitedAt: `${today}T09:30:00Z`,
      doctorId: 'user-doctor-1',
      doctorName: 'Dr. Gregory Mercer, MD',
      treatmentDecision: 'Recommend Discharge Review',
      clinicalNotes: 'Consecutive fever-free criteria successfully met. Lungs clear, oxygen saturation 99%. Recommending administrative discharge.',
      recommendedDischarge: true,
    },
    // p-6: Lucas Silva visited today
    {
      id: 'v-6-0',
      patientId: 'p-6',
      visitDate: today,
      visitedAt: `${today}T10:00:00Z`,
      doctorId: 'user-doctor-1',
      doctorName: 'Dr. Gregory Mercer, MD',
      treatmentDecision: 'Continue Standard Protocol',
      clinicalNotes: 'Temperature trending favorably down to 37.4°C. Continue oral rehydration and current antiviral dosage.',
    },
    // p-12: Arthur Pendelton visited today
    {
      id: 'v-12-0',
      patientId: 'p-12',
      visitDate: today,
      visitedAt: `${today}T10:30:00Z`,
      doctorId: 'user-doctor-1',
      doctorName: 'Dr. Gregory Mercer, MD',
      treatmentDecision: 'Recommend Discharge Review',
      clinicalNotes: 'Elderly patient with remarkable recovery curve. Cleared 4 consecutive fever-free days.',
      recommendedDischarge: true,
    },
    // Past visits
    {
      id: 'v-2-1',
      patientId: 'p-2',
      visitDate: d1,
      visitedAt: `${d1}T11:00:00Z`,
      doctorId: 'user-doctor-1',
      doctorName: 'Dr. Gregory Mercer, MD',
      treatmentDecision: 'Continue Standard Protocol',
      clinicalNotes: 'Day 2 of normal temperature. Monitoring for final clearance.',
    },
    {
      id: 'v-4-1',
      patientId: 'p-4',
      visitDate: d1,
      visitedAt: `${d1}T11:30:00Z`,
      doctorId: 'user-doctor-1',
      doctorName: 'Dr. Gregory Mercer, MD',
      treatmentDecision: 'Prescribe Antiviral & Antipyretic',
      clinicalNotes: 'Persistent fever. Administered acetaminophen and adjusted antiviral infusion.',
    },
  ];

  const initialNotifications: AppNotification[] = [
    {
      id: 'notif-1',
      recipientRole: 'admin',
      type: 'discharge_eligible',
      title: 'Discharge Eligibility: Eleanor Vance',
      message: 'Patient Eleanor Vance in Room 12 has reached 4 consecutive fever-free days and has been recommended for discharge by Dr. Mercer.',
      patientId: 'p-1',
      patientName: 'Eleanor Vance',
      roomNumber: 12,
      createdAt: `${today}T09:35:00Z`,
      isRead: false,
    },
    {
      id: 'notif-2',
      recipientRole: 'admin',
      type: 'discharge_eligible',
      title: 'Discharge Eligibility: Arthur Pendelton',
      message: 'Patient Arthur Pendelton in Room 55 has completed 4 full fever-free days. Admin confirmation required.',
      patientId: 'p-12',
      patientName: 'Arthur Pendelton',
      roomNumber: 55,
      createdAt: `${today}T10:35:00Z`,
      isRead: false,
    },
    {
      id: 'notif-3',
      recipientRole: 'doctor',
      type: 'fever_alert',
      title: 'Urgent Fever Alert: David O\'Connor (38.9°C)',
      message: 'Room 23 - David O\'Connor recorded an elevated fever of 38.9°C today. Awaiting doctor assessment.',
      patientId: 'p-4',
      patientName: 'David O\'Connor',
      roomNumber: 23,
      createdAt: `${today}T08:26:00Z`,
      isRead: false,
    },
    {
      id: 'notif-4',
      recipientRole: 'nurse',
      type: 'temperature_overdue',
      title: 'Overdue Temperature Warning',
      message: 'Hanna Lindqvist (Room 2) and Sophia Chen (Room 5) still require morning temperature measurements.',
      createdAt: `${today}T08:00:00Z`,
      isRead: false,
    },
  ];

  const initialOutcomes: PatientOutcome[] = [
    {
      id: 'out-1',
      patientId: 'hist-1',
      patientDisplayId: 'QC-2026-0001',
      patientName: 'Zoe Washington',
      age: 35,
      gender: 'Female',
      roomNumber: 4,
      admissionDate: d14,
      outcomeDate: d2,
      outcomeType: 'Recovered',
      daysInQuarantine: 12,
      notes: 'Fully resolved viral infection with 4 days fever-free streak before release.',
    },
    {
      id: 'out-2',
      patientId: 'hist-2',
      patientDisplayId: 'QC-2026-0003',
      patientName: 'Mateo Rossi',
      age: 48,
      gender: 'Male',
      roomNumber: 28,
      admissionDate: d12,
      outcomeDate: d3,
      outcomeType: 'Recovered',
      daysInQuarantine: 9,
      notes: 'Discharged in stable condition with clear chest radiography.',
    },
    {
      id: 'out-3',
      patientId: 'hist-3',
      patientDisplayId: 'QC-2026-0004',
      patientName: 'Priya Sharma',
      age: 31,
      gender: 'Female',
      roomNumber: 39,
      admissionDate: d14,
      outcomeDate: d4,
      outcomeType: 'Recovered',
      daysInQuarantine: 10,
      notes: 'Completed 3-day fever free protocol safely.',
    },
    {
      id: 'out-4',
      patientId: 'hist-4',
      patientDisplayId: 'QC-2026-0006',
      patientName: 'Kenji Sato',
      age: 52,
      gender: 'Male',
      roomNumber: 16,
      admissionDate: d10,
      outcomeDate: d1,
      outcomeType: 'Recovered',
      daysInQuarantine: 9,
      notes: 'Successful antiviral therapy, full recovery.',
    },
    {
      id: 'out-5',
      patientId: 'hist-5',
      patientDisplayId: 'QC-2026-0007',
      patientName: 'Ingrid Bergman',
      age: 62,
      gender: 'Female',
      roomNumber: 50,
      admissionDate: d14,
      outcomeDate: d5,
      outcomeType: 'Recovered',
      daysInQuarantine: 9,
      notes: 'No secondary complications observed.',
    },
    {
      id: 'out-6',
      patientId: 'hist-6',
      patientDisplayId: 'QC-2026-0008',
      patientName: 'Grace Kelly',
      age: 26,
      gender: 'Female',
      roomNumber: 22,
      admissionDate: d12,
      outcomeDate: d1,
      outcomeType: 'Recovered',
      daysInQuarantine: 11,
      notes: 'Discharged back to community after stringent protocol.',
    },
    {
      id: 'out-7',
      patientId: 'hist-7',
      patientDisplayId: 'QC-2026-0010',
      patientName: 'Robert Sterling',
      age: 79,
      gender: 'Male',
      roomNumber: 60,
      admissionDate: d10,
      outcomeDate: d3,
      outcomeType: 'Deceased',
      daysInQuarantine: 7,
      notes: 'Severe viral acute respiratory syndrome with multi-organ strain. CPR attempted; family notified.',
    },
  ];

  return {
    patients: initialPatients,
    temperatures: initialTemperatures,
    visits: initialVisits,
    notifications: initialNotifications,
    outcomes: initialOutcomes,
  };
}

export const StorageService = {
  initialize() {
    const lastSeeded = localStorage.getItem(STORAGE_KEYS.LAST_SEEDED);
    const today = getTodayDateString();

    // If never seeded or dates have shifted, seed data
    if (!lastSeeded || !localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      this.resetToDefault();
    }
  },

  resetToDefault() {
    const data = generateInitialData();
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(data.patients));
    localStorage.setItem(STORAGE_KEYS.TEMPERATURE_RECORDS, JSON.stringify(data.temperatures));
    localStorage.setItem(STORAGE_KEYS.DOCTOR_VISITS, JSON.stringify(data.visits));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(data.notifications));
    localStorage.setItem(STORAGE_KEYS.OUTCOMES, JSON.stringify(data.outcomes));
    localStorage.setItem(STORAGE_KEYS.FEVER_THRESHOLD, JSON.stringify(DEFAULT_FEVER_THRESHOLD));
    localStorage.setItem(STORAGE_KEYS.LAST_SEEDED, getTodayDateString());

    // Default user is Nurse Clara Oswald
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS[0]));
    }
  },

  getCurrentUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return DEMO_USERS[0];
  },

  setCurrentUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  },

  getFeverThreshold(): number {
    const raw = localStorage.getItem(STORAGE_KEYS.FEVER_THRESHOLD);
    if (raw) {
      try {
        const val = Number(JSON.parse(raw));
        if (!isNaN(val) && val > 30) return val;
      } catch {}
    }
    return DEFAULT_FEVER_THRESHOLD;
  },

  setFeverThreshold(threshold: number) {
    localStorage.setItem(STORAGE_KEYS.FEVER_THRESHOLD, JSON.stringify(threshold));
  },

  getPatients(): Patient[] {
    const raw = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  },

  savePatients(patients: Patient[]) {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  },

  getTemperatureRecords(): TemperatureRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPERATURE_RECORDS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  },

  saveTemperatureRecords(records: TemperatureRecord[]) {
    localStorage.setItem(STORAGE_KEYS.TEMPERATURE_RECORDS, JSON.stringify(records));
  },

  getDoctorVisits(): DoctorVisit[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCTOR_VISITS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  },

  saveDoctorVisits(visits: DoctorVisit[]) {
    localStorage.setItem(STORAGE_KEYS.DOCTOR_VISITS, JSON.stringify(visits));
  },

  getNotifications(): AppNotification[] {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  },

  saveNotifications(notifications: AppNotification[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  },

  getOutcomes(): PatientOutcome[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OUTCOMES);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  },

  saveOutcomes(outcomes: PatientOutcome[]) {
    localStorage.setItem(STORAGE_KEYS.OUTCOMES, JSON.stringify(outcomes));
  },

  /**
   * Evaluates patient fever-free streak and today's status:
   * Rule:
   * 1. Patient is eligible for discharge only after 3 consecutive full calendar days without fever (< feverThreshold).
   * 2. Temperature >= threshold resets the streak to 0.
   * 3. A missing temperature day does NOT count as fever-free and breaks the streak.
   * 4. Only one official reading per calendar day is counted.
   */
  evaluatePatient(
    patient: Patient,
    temperatures: TemperatureRecord[],
    visits: DoctorVisit[],
    feverThreshold: number = DEFAULT_FEVER_THRESHOLD
  ): PatientDailyEvaluation {
    const today = getTodayDateString();
    const patientTemps = temperatures.filter((t) => t.patientId === patient.id);
    const patientVisits = visits.filter((v) => v.patientId === patient.id);

    // Group temperatures by dateOnly (only 1 official per day)
    const tempsByDate = new Map<string, TemperatureRecord>();
    patientTemps.forEach((t) => {
      // Keep earliest or latest official
      if (!tempsByDate.has(t.dateOnly)) {
        tempsByDate.set(t.dateOnly, t);
      }
    });

    const todayRecord = tempsByDate.get(today);
    const hasRecordedToday = !!todayRecord;

    const todayVisit = patientVisits.find((v) => v.visitDate === today);
    const hasDoctorVisitedToday = !!todayVisit;

    // Calculate streak backwards from today (or yesterday if today is not recorded yet)
    // To become eligible for discharge: 3 full consecutive calendar days fever-free
    let streak = 0;
    let checkDateStr = today;

    // If today is recorded:
    if (hasRecordedToday) {
      if (todayRecord.temperature >= feverThreshold) {
        streak = 0;
      } else {
        streak = 1;
        // check prior consecutive days
        let daysBack = 1;
        while (true) {
          const priorDate = subtractDays(today, daysBack);
          // Don't look before admission date
          if (priorDate < patient.admissionDate) break;
          const rec = tempsByDate.get(priorDate);
          if (rec && rec.temperature < feverThreshold) {
            streak++;
            daysBack++;
          } else {
            // Missing day or fever -> breaks streak
            break;
          }
        }
      }
    } else {
      // Today not recorded yet. Check streak up to yesterday.
      let daysBack = 1;
      while (true) {
        const priorDate = subtractDays(today, daysBack);
        if (priorDate < patient.admissionDate) break;
        const rec = tempsByDate.get(priorDate);
        if (rec && rec.temperature < feverThreshold) {
          streak++;
          daysBack++;
        } else {
          break;
        }
      }
    }

    // Latest recorded temperature
    const sortedTemps = [...patientTemps].sort(
      (a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
    );
    const latestTemperature = sortedTemps[0];

    // Trend calculation
    let trend: 'improving' | 'stable' | 'deteriorating' | 'fever' = 'stable';
    if (latestTemperature) {
      if (latestTemperature.temperature >= feverThreshold) {
        trend = 'fever';
      } else if (sortedTemps.length >= 2) {
        const diff = latestTemperature.temperature - sortedTemps[1].temperature;
        if (diff < -0.3) trend = 'improving';
        else if (diff > 0.4) trend = 'deteriorating';
        else trend = 'stable';
      } else {
        trend = 'stable';
      }
    }

    const isDischargeEligible = streak >= 3 && patient.status === 'Admitted';
    const isOverdueTemp = !hasRecordedToday && patient.status === 'Admitted';

    return {
      patient,
      hasRecordedToday,
      todayRecord,
      hasDoctorVisitedToday,
      todayVisit,
      feverFreeStreak: streak,
      isDischargeEligible,
      latestTemperature,
      trend,
      isOverdueTemp,
    };
  },
};
