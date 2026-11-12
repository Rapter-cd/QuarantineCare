import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  UserRole,
  Patient,
  TemperatureRecord,
  DoctorVisit,
  AppNotification,
  PatientOutcome,
  PatientDailyEvaluation,
  TreatmentDecision,
} from '../types';
import {
  StorageService,
  TOTAL_CAPACITY,
  DEFAULT_FEVER_THRESHOLD,
  DEMO_USERS,
} from '../utils/storage';
import { getTodayDateString, formatDateTime, getDaysBetween } from '../utils/dateUtils';

interface AppContextType {
  currentUser: User | null;
  login: (email: string, role?: UserRole) => boolean;
  logout: () => void;
  switchRole: (role: UserRole) => void;
  demoUsers: User[];

  patients: Patient[];
  temperatureRecords: TemperatureRecord[];
  doctorVisits: DoctorVisit[];
  notifications: AppNotification[];
  outcomes: PatientOutcome[];
  feverThreshold: number;
  setFeverThreshold: (thresh: number) => void;

  evaluations: Record<string, PatientDailyEvaluation>;
  activePatients: Patient[];
  occupiedRooms: Set<number>;
  availableBedsCount: number;
  totalCapacity: number;

  recordTemperature: (
    patientId: string,
    temp: number,
    notes?: string
  ) => { success: boolean; message: string };

  completeDoctorVisit: (
    patientId: string,
    decision: TreatmentDecision,
    clinicalNotes: string,
    observations?: string
  ) => { success: boolean; message: string };

  registerPatient: (patientData: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    roomNumber: number;
    contactDetails?: string;
    initialTemperature: number;
    notes?: string;
  }) => { success: boolean; message: string; patient?: Patient };

  dischargePatient: (
    patientId: string,
    notes?: string
  ) => { success: boolean; message: string };

  recordDeceasedPatient: (
    patientId: string,
    notes?: string
  ) => { success: boolean; message: string };

  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [temperatureRecords, setTemperatureRecords] = useState<TemperatureRecord[]>([]);
  const [doctorVisits, setDoctorVisits] = useState<DoctorVisit[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [outcomes, setOutcomes] = useState<PatientOutcome[]>([]);
  const [feverThreshold, setFeverThresholdState] = useState<number>(DEFAULT_FEVER_THRESHOLD);

  // Initialize and load from local storage
  const loadState = useCallback(() => {
    StorageService.initialize();
    setCurrentUserState(StorageService.getCurrentUser());
    setPatients(StorageService.getPatients());
    setTemperatureRecords(StorageService.getTemperatureRecords());
    setDoctorVisits(StorageService.getDoctorVisits());
    setNotifications(StorageService.getNotifications());
    setOutcomes(StorageService.getOutcomes());
    setFeverThresholdState(StorageService.getFeverThreshold());
  }, []);

  useEffect(() => {
    loadState();
  }, [loadState]);

  const login = (email: string, role?: UserRole): boolean => {
    const matched = DEMO_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() ||
        (role && u.role === role)
    );
    if (matched) {
      StorageService.setCurrentUser(matched);
      setCurrentUserState(matched);
      return true;
    }
    // Fallback created demo user
    const fallbackUser: User = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0].toUpperCase(),
      email,
      role: role || 'nurse',
      title: 'Quarantine Staff',
      department: 'General Staff',
    };
    StorageService.setCurrentUser(fallbackUser);
    setCurrentUserState(fallbackUser);
    return true;
  };

  const logout = () => {
    setCurrentUserState(null);
    localStorage.removeItem('qc_current_user');
  };

  const switchRole = (role: UserRole) => {
    const target = DEMO_USERS.find((u) => u.role === role);
    if (target) {
      StorageService.setCurrentUser(target);
      setCurrentUserState(target);
    }
  };

  const setFeverThreshold = (thresh: number) => {
    StorageService.setFeverThreshold(thresh);
    setFeverThresholdState(thresh);
  };

  // Evaluations for each patient
  const evaluations = useMemo(() => {
    const evals: Record<string, PatientDailyEvaluation> = {};
    for (const patient of patients) {
      evals[patient.id] = StorageService.evaluatePatient(
        patient,
        temperatureRecords,
        doctorVisits,
        feverThreshold
      );
    }
    return evals;
  }, [patients, temperatureRecords, doctorVisits, feverThreshold]);

  const activePatients = useMemo(() => {
    return patients.filter((p) => p.status === 'Admitted');
  }, [patients]);

  const occupiedRooms = useMemo(() => {
    return new Set(activePatients.map((p) => p.roomNumber));
  }, [activePatients]);

  const availableBedsCount = TOTAL_CAPACITY - occupiedRooms.size;

  // Record daily temperature (Enforces 1 record per calendar day)
  const recordTemperature = (
    patientId: string,
    temp: number,
    notes?: string
  ): { success: boolean; message: string } => {
    if (temp < 33 || temp > 43) {
      return { success: false, message: 'Invalid temperature value. Must be between 33°C and 43°C.' };
    }

    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      return { success: false, message: 'Patient not found.' };
    }

    if (patient.status !== 'Admitted') {
      return { success: false, message: 'Cannot record temperature for a non-admitted patient.' };
    }

    const today = getTodayDateString();
    const existingToday = temperatureRecords.find(
      (r) => r.patientId === patientId && r.dateOnly === today
    );

    if (existingToday) {
      return {
        success: false,
        message: `Duplicate entry blocked! Temperature has already been officially recorded for ${patient.name} today (${existingToday.temperature}°C at ${formatDateTime(existingToday.recordedAt)}).`,
      };
    }

    const hasFever = temp >= feverThreshold;
    const nowIso = new Date().toISOString();
    const newRecord: TemperatureRecord = {
      id: `t-${Date.now()}`,
      patientId,
      temperature: Number(temp.toFixed(1)),
      dateOnly: today,
      recordedAt: nowIso,
      recordedBy: currentUser ? currentUser.name : 'Quarantine Nurse',
      recordedById: currentUser?.id,
      notes: notes?.trim() || undefined,
      hasFever,
    };

    const updatedTemps = [newRecord, ...temperatureRecords];
    StorageService.saveTemperatureRecords(updatedTemps);
    setTemperatureRecords(updatedTemps);

    // Create notifications based on record
    const updatedNotifications = [...notifications];
    if (hasFever) {
      updatedNotifications.unshift({
        id: `notif-${Date.now()}-fever`,
        recipientRole: 'doctor',
        type: 'fever_alert',
        title: `Fever Spike: ${patient.name} (${temp.toFixed(1)}°C)`,
        message: `Elevated temperature of ${temp.toFixed(1)}°C recorded in Room ${patient.roomNumber}. Doctor clinical review advised.`,
        patientId: patient.id,
        patientName: patient.name,
        roomNumber: patient.roomNumber,
        createdAt: nowIso,
        isRead: false,
      });
    }

    // Check if this new temp completes 3-day fever-free streak!
    const testEval = StorageService.evaluatePatient(
      patient,
      updatedTemps,
      doctorVisits,
      feverThreshold
    );
    if (testEval.isDischargeEligible) {
      updatedNotifications.unshift({
        id: `notif-${Date.now()}-discharge`,
        recipientRole: 'admin',
        type: 'discharge_eligible',
        title: `Discharge Eligibility: ${patient.name}`,
        message: `${patient.name} (Room ${patient.roomNumber}) has achieved ${testEval.feverFreeStreak} consecutive fever-free days. Ready for administrative discharge.`,
        patientId: patient.id,
        patientName: patient.name,
        roomNumber: patient.roomNumber,
        createdAt: nowIso,
        isRead: false,
      });
    }

    StorageService.saveNotifications(updatedNotifications);
    setNotifications(updatedNotifications);

    return {
      success: true,
      message: `Successfully recorded ${temp.toFixed(1)}°C for ${patient.name} (Room ${patient.roomNumber}).`,
    };
  };

  // Complete Doctor Visit (Enforces temperature must be recorded today first)
  const completeDoctorVisit = (
    patientId: string,
    decision: TreatmentDecision,
    clinicalNotes: string,
    observations?: string
  ): { success: boolean; message: string } => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      return { success: false, message: 'Patient not found.' };
    }

    if (patient.status !== 'Admitted') {
      return { success: false, message: 'Cannot record visit for non-admitted patient.' };
    }

    const today = getTodayDateString();

    // WORKFLOW RULE: A doctor should not be able to mark a visit as completed until patient's temperature has been recorded for that day.
    const tempToday = temperatureRecords.find(
      (r) => r.patientId === patientId && r.dateOnly === today
    );

    if (!tempToday) {
      return {
        success: false,
        message: `Workflow Constraint: A doctor visit cannot be completed before today's temperature reading is recorded by nursing staff.`,
      };
    }

    // Prevent duplicate visit on same day
    const existingVisit = doctorVisits.find(
      (v) => v.patientId === patientId && v.visitDate === today
    );
    if (existingVisit) {
      return {
        success: false,
        message: `Doctor visit has already been completed today for ${patient.name} at ${formatDateTime(existingVisit.visitedAt)}.`,
      };
    }

    const nowIso = new Date().toISOString();
    const isDischargeRec = decision === 'Recommend Discharge Review';

    const newVisit: DoctorVisit = {
      id: `v-${Date.now()}`,
      patientId,
      visitDate: today,
      visitedAt: nowIso,
      doctorId: currentUser?.id || 'doc-1',
      doctorName: currentUser?.name || 'Dr. Gregory Mercer, MD',
      treatmentDecision: decision,
      clinicalNotes: clinicalNotes.trim(),
      observations: observations?.trim() || undefined,
      recommendedDischarge: isDischargeRec,
    };

    const updatedVisits = [newVisit, ...doctorVisits];
    StorageService.saveDoctorVisits(updatedVisits);
    setDoctorVisits(updatedVisits);

    // If discharge recommended, notify admin
    if (isDischargeRec) {
      const updatedNotifications = [
        {
          id: `notif-${Date.now()}-doc-disch`,
          recipientRole: 'admin' as const,
          type: 'discharge_eligible' as const,
          title: `Doctor Approved Discharge: ${patient.name}`,
          message: `Dr. ${currentUser?.name || 'Mercer'} reviewed ${patient.name} in Room ${patient.roomNumber} and submitted: "${clinicalNotes}". Ready for room release.`,
          patientId: patient.id,
          patientName: patient.name,
          roomNumber: patient.roomNumber,
          createdAt: nowIso,
          isRead: false,
        },
        ...notifications,
      ];
      StorageService.saveNotifications(updatedNotifications);
      setNotifications(updatedNotifications);
    }

    return {
      success: true,
      message: `Doctor visit logged successfully for ${patient.name}.`,
    };
  };

  // Register New Patient
  const registerPatient = (patientData: {
    name: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    roomNumber: number;
    contactDetails?: string;
    initialTemperature: number;
    notes?: string;
  }): { success: boolean; message: string; patient?: Patient } => {
    // Validation
    if (!patientData.name.trim()) {
      return { success: false, message: 'Patient full name is required.' };
    }
    if (patientData.age < 0 || patientData.age > 125) {
      return { success: false, message: 'Please enter a valid age (0 - 125).' };
    }
    if (patientData.roomNumber < 1 || patientData.roomNumber > TOTAL_CAPACITY) {
      return {
        success: false,
        message: `Room number must be between 1 and ${TOTAL_CAPACITY}.`,
      };
    }
    if (occupiedRooms.has(patientData.roomNumber)) {
      return {
        success: false,
        message: `Room ${patientData.roomNumber} is currently occupied! Please select an available bed.`,
      };
    }
    if (
      patientData.initialTemperature < 33 ||
      patientData.initialTemperature > 43
    ) {
      return {
        success: false,
        message: 'Initial temperature must be between 33°C and 43°C.',
      };
    }

    const today = getTodayDateString();
    const nowIso = new Date().toISOString();

    // Auto generate unique formatted patient ID (e.g., QC-2026-0089)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generatedPatientId = `QC-${new Date().getFullYear()}-${randomSuffix}`;
    const newId = `p-${Date.now()}`;

    const newPatient: Patient = {
      id: newId,
      patientId: generatedPatientId,
      name: patientData.name.trim(),
      age: patientData.age,
      gender: patientData.gender,
      roomNumber: patientData.roomNumber,
      admissionDate: today,
      contactDetails: patientData.contactDetails?.trim() || undefined,
      initialTemperature: Number(patientData.initialTemperature.toFixed(1)),
      status: 'Admitted',
      notes: patientData.notes?.trim() || undefined,
    };

    // Automatically record the initial admission temperature
    const initialTempRecord: TemperatureRecord = {
      id: `t-${Date.now()}`,
      patientId: newId,
      temperature: Number(patientData.initialTemperature.toFixed(1)),
      dateOnly: today,
      recordedAt: nowIso,
      recordedBy: currentUser ? currentUser.name : 'Intake Triage',
      notes: 'Initial admission baseline vitals.',
      hasFever: patientData.initialTemperature >= feverThreshold,
    };

    const updatedPatients = [newPatient, ...patients];
    const updatedTemps = [initialTempRecord, ...temperatureRecords];

    const updatedNotifications = [
      {
        id: `notif-${Date.now()}-adm`,
        recipientRole: 'all' as const,
        type: 'admission_created' as const,
        title: `New Admission: ${newPatient.name} (Room ${newPatient.roomNumber})`,
        message: `Admitted under ID ${newPatient.patientId}. Initial temp: ${newPatient.initialTemperature}°C.`,
        patientId: newPatient.id,
        patientName: newPatient.name,
        roomNumber: newPatient.roomNumber,
        createdAt: nowIso,
        isRead: false,
      },
      ...notifications,
    ];

    StorageService.savePatients(updatedPatients);
    StorageService.saveTemperatureRecords(updatedTemps);
    StorageService.saveNotifications(updatedNotifications);

    setPatients(updatedPatients);
    setTemperatureRecords(updatedTemps);
    setNotifications(updatedNotifications);

    return {
      success: true,
      message: `Patient ${newPatient.name} successfully admitted to Room ${newPatient.roomNumber} with ID ${newPatient.patientId}.`,
      patient: newPatient,
    };
  };

  // Discharge Patient (Admin explicit action)
  const dischargePatient = (
    patientId: string,
    notes?: string
  ): { success: boolean; message: string } => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) {
      return { success: false, message: 'Patient not found.' };
    }

    if (patient.status !== 'Admitted') {
      return { success: false, message: 'Patient is already discharged or resolved.' };
    }

    const today = getTodayDateString();
    const nowIso = new Date().toISOString();
    const daysInQuarantine = getDaysBetween(patient.admissionDate, today);

    // Update patient status to Discharged
    const updatedPatients = patients.map((p) => {
      if (p.id === patientId) {
        return {
          ...p,
          status: 'Discharged' as const,
          dischargeDate: today,
        };
      }
      return p;
    });

    // Record historical outcome
    const newOutcome: PatientOutcome = {
      id: `out-${Date.now()}`,
      patientId: patient.id,
      patientDisplayId: patient.patientId,
      patientName: patient.name,
      age: patient.age,
      gender: patient.gender,
      roomNumber: patient.roomNumber,
      admissionDate: patient.admissionDate,
      outcomeDate: today,
      outcomeType: 'Recovered',
      daysInQuarantine,
      notes: notes?.trim() || 'Successfully cleared 3-day fever-free protocol and discharged home.',
    };

    const updatedOutcomes = [newOutcome, ...outcomes];

    // Create system notification
    const updatedNotifications = [
      {
        id: `notif-${Date.now()}-discharged`,
        recipientRole: 'all' as const,
        type: 'patient_discharged' as const,
        title: `Patient Discharged: ${patient.name}`,
        message: `${patient.name} has been safely discharged. Bed ${patient.roomNumber} is now sanitized and available for intake.`,
        patientId: patient.id,
        patientName: patient.name,
        roomNumber: patient.roomNumber,
        createdAt: nowIso,
        isRead: false,
      },
      ...notifications,
    ];

    StorageService.savePatients(updatedPatients);
    StorageService.saveOutcomes(updatedOutcomes);
    StorageService.saveNotifications(updatedNotifications);

    setPatients(updatedPatients);
    setOutcomes(updatedOutcomes);
    setNotifications(updatedNotifications);

    return {
      success: true,
      message: `${patient.name} has been officially discharged! Room ${patient.roomNumber} has been released and is now available.`,
    };
  };

  // Record Deceased Patient (for clinical realism and mortality rate analytics)
  const recordDeceasedPatient = (
    patientId: string,
    notes?: string
  ): { success: boolean; message: string } => {
    const patient = patients.find((p) => p.id === patientId);
    if (!patient) return { success: false, message: 'Patient not found.' };

    const today = getTodayDateString();
    const nowIso = new Date().toISOString();
    const daysInQuarantine = getDaysBetween(patient.admissionDate, today);

    const updatedPatients = patients.map((p) => {
      if (p.id === patientId) {
        return {
          ...p,
          status: 'Deceased' as const,
          dischargeDate: today,
        };
      }
      return p;
    });

    const newOutcome: PatientOutcome = {
      id: `out-${Date.now()}`,
      patientId: patient.id,
      patientDisplayId: patient.patientId,
      patientName: patient.name,
      age: patient.age,
      gender: patient.gender,
      roomNumber: patient.roomNumber,
      admissionDate: patient.admissionDate,
      outcomeDate: today,
      outcomeType: 'Deceased',
      daysInQuarantine,
      notes: notes?.trim() || 'Terminal viral complication. Bed released.',
    };

    const updatedOutcomes = [newOutcome, ...outcomes];
    StorageService.savePatients(updatedPatients);
    StorageService.saveOutcomes(updatedOutcomes);

    setPatients(updatedPatients);
    setOutcomes(updatedOutcomes);

    return {
      success: true,
      message: `Patient outcome recorded as Deceased. Room ${patient.roomNumber} released.`,
    };
  };

  const markNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    StorageService.saveNotifications(updated);
    setNotifications(updated);
  };

  const markAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    StorageService.saveNotifications(updated);
    setNotifications(updated);
  };

  const resetDemoData = () => {
    StorageService.resetToDefault();
    loadState();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        login,
        logout,
        switchRole,
        demoUsers: DEMO_USERS,
        patients,
        temperatureRecords,
        doctorVisits,
        notifications,
        outcomes,
        feverThreshold,
        setFeverThreshold,
        evaluations,
        activePatients,
        occupiedRooms,
        availableBedsCount,
        totalCapacity: TOTAL_CAPACITY,
        recordTemperature,
        completeDoctorVisit,
        registerPatient,
        dischargePatient,
        recordDeceasedPatient,
        markNotificationRead,
        markAllNotificationsRead,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
