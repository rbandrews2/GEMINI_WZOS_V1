import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  Job,
  TimeEntry,
  Contact,
  FieldFormTemplate,
  FormSubmission,
  NotificationItem,
  GoogleMeetMeeting,
  TaskCategory,
  ActiveNavTab,
  FieldSyncState,
} from '../types';

interface AppContextType {
  // Auth state
  currentUser: User | null;
  users: User[];
  login: (username: string, password?: string) => boolean;
  logout: () => void;
  switchUserRole: (role: 'admin' | 'member') => void;
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Active Time Clock
  activeEntry: TimeEntry | null;
  activeSeconds: number;
  clockIn: (jobId: string, task: TaskCategory, notes?: string) => void;
  clockOut: (notes?: string) => void;
  switchTask: (newTask: TaskCategory, notes?: string) => void;

  // Time Entries / Sheets
  timeEntries: TimeEntry[];
  addManualTimeEntry: (entry: Omit<TimeEntry, 'id'>) => void;
  updateTimeEntry: (id: string, updates: Partial<TimeEntry>) => void;
  deleteTimeEntry: (id: string) => void;
  approveTimeEntry: (id: string) => void;

  // Jobs
  jobs: Job[];
  addJob: (job: Omit<Job, 'id'>) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;

  // Contacts
  contacts: Contact[];
  addContact: (contact: Omit<Contact, 'id'>) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  deleteContact: (id: string) => void;
  bulkImportContacts: (newContacts: Omit<Contact, 'id'>[]) => void;

  // Forms
  formTemplates: FieldFormTemplate[];
  addFormTemplate: (template: Omit<FieldFormTemplate, 'id'>) => void;
  deleteFormTemplate: (id: string) => void;
  formSubmissions: FormSubmission[];
  submitForm: (submission: Omit<FormSubmission, 'id' | 'submittedAt'>) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  acknowledgeNotification: (id: string) => void;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read' | 'acknowledged'>) => void;

  // Google Meet Video Sync (Admins create, all view & join)
  meetings: GoogleMeetMeeting[];
  addMeeting: (meeting: Omit<GoogleMeetMeeting, 'id' | 'createdAt'>) => void;
  updateMeeting: (id: string, updates: Partial<GoogleMeetMeeting>) => void;
  deleteMeeting: (id: string) => void;

  // Navigation & Viewport State
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  selectedJobForNav: Job | null;
  setSelectedJobForNav: (job: Job | null) => void;
  isAndroidViewFrame: boolean;
  setIsAndroidViewFrame: (val: boolean | ((prev: boolean) => boolean)) => void;

  // Offline & Cellular Service State
  isOnline: boolean;
  isSimulatedOffline: boolean;
  setIsSimulatedOffline: (val: boolean | ((prev: boolean) => boolean)) => void;
  offlineQueueCount: number;
  syncOfflineQueue: () => void;
  lastSyncTime: string;

  // Visual Sync Status Tracking ('Synced' | 'Queued' | 'Error')
  timeClockSyncState: FieldSyncState;
  formSyncState: FieldSyncState;
  overallSyncState: FieldSyncState;
  queuedTimeEntriesCount: number;
  queuedFormsCount: number;
  errorCount: number;
  syncErrorMessage: string | null;
  simulatedSyncError: boolean;
  setSimulatedSyncError: (val: boolean | ((prev: boolean) => boolean)) => void;
  queueSampleOfflinePunch: () => void;
  queueSampleOfflineForm: () => void;

  // Audio / Tactile Feedback
  playBeep: (type?: 'punch' | 'alert' | 'success') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Seed Users
const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    username: 'admin',
    password: 'admin123',
    name: 'Marcus Vance',
    role: 'admin',
    position: 'Operations & Safety Director',
    phone: '(555) 019-4411',
    employeeId: 'WZ-EMP-001',
    avatarUrl: '/src/assets/images/field_worker_avatar_1792226590523.jpg',
    createdAt: '2026-01-10T08:00:00Z',
  },
  {
    id: 'usr-member-1',
    username: 'mrodriguez',
    password: 'worker123',
    name: 'Maria Rodriguez',
    role: 'member',
    position: 'Traffic Control Supervisor (TCS)',
    phone: '(555) 019-7220',
    employeeId: 'WZ-EMP-014',
    avatarUrl: '/src/assets/images/field_worker_avatar_1792226590523.jpg',
    createdAt: '2026-02-01T08:00:00Z',
  },
  {
    id: 'usr-member-2',
    username: 'sjenkins',
    password: 'worker123',
    name: 'Sam Jenkins',
    role: 'member',
    position: 'Flagger Lead & Field Tech',
    phone: '(555) 019-8391',
    employeeId: 'WZ-EMP-022',
    createdAt: '2026-02-15T08:00:00Z',
  },
  {
    id: 'usr-member-3',
    username: 'dconner',
    password: 'worker123',
    name: 'Dave Conner',
    role: 'member',
    position: 'TMA Truck Attenuator Operator',
    phone: '(555) 019-6129',
    employeeId: 'WZ-EMP-031',
    createdAt: '2026-03-01T08:00:00Z',
  },
];

// Initial Seed Jobs
const INITIAL_JOBS: Job[] = [
  {
    id: 'job-104',
    jobNumber: 'WZ-104',
    title: 'US-101 NB Night Lane Closure MP 44-48',
    client: 'Superior Traffic Services / Caltrans D4',
    locationName: 'US-101 Northbound Corridor',
    address: 'US-101 NB Milepost 46.2, San Jose, CA',
    coordinates: [37.3382, -121.8863],
    closureType: 'Right 2 Lanes & Shoulder Taper',
    status: 'active',
    assignedMemberIds: ['usr-member-1', 'usr-member-2', 'usr-member-3'],
    safetyNotes: 'MUTCD Section 6C.08 compliance mandatory. Set attenuator truck 100ft back from taper buffer. Class 3 vests & illuminated wands required.',
    speedLimit: 45,
    startDate: '2026-10-16',
  },
  {
    id: 'job-209',
    jobNumber: 'WZ-209',
    title: 'I-880 SB Paving & Barrier Shift',
    client: 'Granite Construction',
    locationName: 'I-880 Southbound at Auto Mall',
    address: 'I-880 SB Exit 21, Fremont, CA',
    coordinates: [37.5485, -121.9886],
    closureType: 'Rolling Slowdown & 3-Lane Taper',
    status: 'active',
    assignedMemberIds: ['usr-member-1', 'usr-member-3'],
    safetyNotes: 'Highway patrol rolling block active at 22:00. Maintain continuous radio check on Channel 4.',
    speedLimit: 35,
    startDate: '2026-10-17',
  },
  {
    id: 'job-312',
    jobNumber: 'WZ-312',
    title: 'State Route 85 Bridge Deck Rehabilitation',
    client: 'Walsh Group / VTA',
    locationName: 'SR-85 at Blossom Hill Rd',
    address: 'SR-85 Southbound, Los Gatos, CA',
    coordinates: [37.2358, -121.9624],
    closureType: 'Left Lane & On-Ramp Metering Control',
    status: 'scheduled',
    assignedMemberIds: ['usr-member-2'],
    safetyNotes: 'Check overhead electronic message board before taper setup. Verify ramp queue sensor operation.',
    speedLimit: 40,
    startDate: '2026-10-18',
  },
  {
    id: 'job-405',
    jobNumber: 'WZ-405',
    title: 'Hwy 17 Storm Culvert & Tree Clearing',
    client: 'Santa Cruz County DOT',
    locationName: 'Highway 17 Mountain Pass',
    address: 'Hwy 17 Milepost 8.4, Scotts Valley, CA',
    coordinates: [37.0511, -122.0142],
    closureType: 'One-Way Reversible Flagging Operation',
    status: 'scheduled',
    assignedMemberIds: ['usr-member-1', 'usr-member-2'],
    safetyNotes: 'Mountain curves require 800ft advance warning signs. Blind curve radar speed feedback in place.',
    speedLimit: 25,
    startDate: '2026-10-19',
  },
];

// Initial Seed Contacts
const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'cnt-1',
    name: '24/7 Operations Dispatch',
    position: 'Central Road Work Dispatcher',
    phone: '(555) 019-2830',
    department: 'Dispatch',
    isEmergency: true,
    notes: 'Primary line for emergency lane closure clearance and crew adjustments.',
  },
  {
    id: 'cnt-2',
    name: 'Marcus Vance',
    position: 'Operations & Safety Director',
    phone: '(555) 019-4411',
    department: 'Supervision',
    isEmergency: true,
    notes: 'Escalations, OSHA/MUTCD audits, and severe incidents.',
  },
  {
    id: 'cnt-3',
    name: 'Maria Rodriguez',
    position: 'Traffic Control Supervisor (TCS)',
    phone: '(555) 019-7220',
    department: 'Field Crew',
    notes: 'Lead TCS for Bay Area Highway corridors.',
  },
  {
    id: 'cnt-4',
    name: 'Sam Jenkins',
    position: 'Flagger Lead & Field Tech',
    phone: '(555) 019-8391',
    department: 'Field Crew',
    notes: 'Taper setups, sign installations, and flagger stationing.',
  },
  {
    id: 'cnt-5',
    name: 'Dave Conner',
    position: 'TMA Attenuator Lead Driver',
    phone: '(555) 019-6129',
    department: 'Fleet',
    notes: 'Scorpion TMA truck deployment & maintenance.',
  },
  {
    id: 'cnt-6',
    name: 'Elena Vasquez',
    position: 'Caltrans District 4 Resident Engineer',
    phone: '(555) 019-3388',
    department: 'Agency / DOT',
    notes: 'State inspector for US-101 and I-880 permit verification.',
  },
  {
    id: 'cnt-7',
    name: 'Apex TMA & Arrow Fleet Yard',
    position: 'Equipment & Trailer Maintenance',
    phone: '(555) 019-9944',
    department: 'Fleet Support',
    notes: 'Diesel, solar batteries, crash cushion replacement parts.',
  },
  {
    id: 'cnt-8',
    name: 'CHP Golden Gate Division Liaison',
    position: 'Highway Patrol Traffic Officer',
    phone: '(555) 019-5500',
    department: 'Enforcement',
    isEmergency: true,
    notes: 'Officer escorts and speed enforcement in live taper zones.',
  },
];

// Initial Seed Form Templates
const INITIAL_FORMS: FieldFormTemplate[] = [
  {
    id: 'form-mutcd-inspection',
    title: 'Daily Work Zone MUTCD Inspection & Sign Log',
    category: 'Inspection',
    description: 'Mandatory pre-shift and mid-shift audit of signs, cone taper lengths, attenuator standoff, and arrow board visibility.',
    destination: 'safety@superiorllc.org',
    fields: [
      { id: 'shift_time', label: 'Inspection Time & Shift', type: 'select', options: ['Pre-Shift (Before Traffic)', 'Active Shift Check', 'Post-Shift Breakdown'], required: true },
      { id: 'taper_length', label: 'Taper Length & Cone Spacing Compliant with State Standards', type: 'boolean', required: true, defaultValue: true },
      { id: 'signs_clean', label: 'All Warning Signs Clean, Visible, and at Prescribed Distances', type: 'boolean', required: true, defaultValue: true },
      { id: 'arrow_board_mode', label: 'Arrow Board Operating Mode', type: 'select', options: ['Left Flashing Arrow', 'Right Flashing Arrow', 'Double Arrow', 'Four Corner Caution', 'Flashing Bar'], required: true },
      { id: 'tma_standoff_distance', label: 'Attenuator Truck Standoff Buffer Distance (Feet)', type: 'number', required: true, defaultValue: 100 },
      { id: 'weather_conditions', label: 'Field Conditions & Visibility', type: 'select', options: ['Clear Daylight', 'Rain / Wet Asphalt', 'Fog / Heavy Smoke', 'Night Darkness / Illuminated'], required: true },
      { id: 'inspector_notes', label: 'Deficiencies, Adjustments Made or Sign Replacements', type: 'textarea', required: false, placeholder: 'Replaced missing cone at Station 12; cleaned reflector on ROAD WORK AHEAD sign.' },
      { id: 'inspector_signature', label: 'TCS Certified Signature', type: 'signature', required: true },
    ],
  },
  {
    id: 'form-jha-safety',
    title: 'Job Hazard Analysis (JHA) & Tailgate Safety Briefing',
    category: 'Safety',
    description: 'Daily hazard assessment completed with crew prior to setting foot in the live highway right-of-way.',
    destination: 'safety@superiorllc.org',
    fields: [
      { id: 'speed_traffic', label: 'Live Traffic Flow Speed Estimate (MPH)', type: 'number', required: true, defaultValue: 65 },
      { id: 'escape_route', label: 'Identified Clear Escape Route for All Ground Flaggers', type: 'boolean', required: true, defaultValue: true },
      { id: 'pinch_points', label: 'Blind Spots & Heavy Machinery Swing Radii Identified', type: 'boolean', required: true, defaultValue: true },
      { id: 'ppe_verified', label: 'All Crew in ANSI Class 3 Vests, Hard Hats, and Steel Toe Boots', type: 'boolean', required: true, defaultValue: true },
      { id: 'radio_comms_tested', label: 'Two-Way Radios Tested on Work Zone Tactical Channel', type: 'boolean', required: true, defaultValue: true },
      { id: 'specific_hazards', label: 'Specific Job Hazards Discussed with Crew', type: 'textarea', required: true, placeholder: 'High speed commuter traffic, low shoulder lighting, loose gravel near exit ramp.' },
      { id: 'lead_signature', label: 'Briefing Supervisor Signature', type: 'signature', required: true },
    ],
  },
  {
    id: 'form-tma-pretrip',
    title: 'Truck-Mounted Attenuator (TMA) Pre-Trip Inspection',
    category: 'Equipment',
    description: 'DOT-compliant safety verification for crash cushion, hydraulic hoist, lighting, and emergency air brakes.',
    destination: 'fleet@superiorllc.org',
    fields: [
      { id: 'tma_unit_number', label: 'TMA Truck Unit Number', type: 'select', options: ['TMA-01 (Ford F-750)', 'TMA-04 (Freightliner M2)', 'TMA-07 (International MV)', 'TMA-12 (Scorpion Rig)'], required: true },
      { id: 'odometer', label: 'Current Vehicle Mileage', type: 'number', required: true, defaultValue: 48250 },
      { id: 'hydraulic_hoist', label: 'Hydraulic Hoist Raises & Locks Attenuator Smoothly', type: 'boolean', required: true, defaultValue: true },
      { id: 'shear_bolts', label: 'Cartridge Shear Bolts & Safety Pins Inspected and Intact', type: 'boolean', required: true, defaultValue: true },
      { id: 'arrow_panel_lights', label: 'LED Arrow Board Lamps All Functioning (No Burnouts)', type: 'boolean', required: true, defaultValue: true },
      { id: 'backup_alarm', label: 'Reverse Alarm and Emergency Air Horn Verified', type: 'boolean', required: true, defaultValue: true },
      { id: 'maintenance_notes', label: 'Maintenance Issues or Fluid Leaks', type: 'textarea', required: false, placeholder: 'Hydraulic cylinder clean; tire tread verified at 8/32".' },
      { id: 'driver_signature', label: 'Certified Operator Signature', type: 'signature', required: true },
    ],
  },
  {
    id: 'form-incident-report',
    title: 'Work Zone Incident & Near-Miss Report',
    category: 'Incident',
    description: 'Document vehicle incursions, damaged equipment, driver confrontations, or near-miss safety hazards.',
    destination: 'dispatch@superiorllc.org',
    fields: [
      { id: 'incident_type', label: 'Incident Classification', type: 'select', options: ['Near-Miss (Errant Vehicle)', 'Vehicle Hit Traffic Cone / Barrel', 'Attenuator Impact', 'Worker Injury / Slip', 'Public Confrontation / Speeding'], required: true },
      { id: 'vehicle_details', label: 'Vehicle Make, Model, Color, or License Plate (if observed)', type: 'text', required: false, placeholder: 'White delivery box truck, partial plate 8XYZ...' },
      { id: 'injuries_sustained', label: 'Any Injuries Sustained on Site?', type: 'select', options: ['None - No injuries', 'Minor First Aid Only', 'Emergency Medical Needed'], required: true },
      { id: 'equipment_damage', label: 'Estimated Equipment Damage Description', type: 'textarea', required: true, placeholder: 'Three 28-inch traffic cones crushed; arrow board trailer unaffected.' },
      { id: 'police_report_filed', label: 'Police / CHP Report Filed?', type: 'select', options: ['Yes - Officer Dispatched', 'No - Near-Miss Only', 'Pending Police Contact'], required: true },
      { id: 'reporter_signature', label: 'Reporting Member Signature', type: 'signature', required: true },
    ],
  },
];

// Initial Seed Notifications
const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: "Tomorrow's Shift Assignment: Job #WZ-104 US-101 NB",
    message: 'Report Time: 05:30 AM at Main Equipment Yard. Assigned Role: Lead TCS & Taper Setup. TMA Unit #04 assigned with Sam Jenkins. Review MUTCD Chapter 6 lane closure checklist.',
    type: 'assignment',
    createdAt: '2026-10-17T06:30:00Z',
    targetUserId: 'all',
    shiftDate: 'Tomorrow, Oct 18 • 05:30 AM',
    read: false,
    acknowledged: false,
    senderName: 'Marcus Vance (Dispatch)',
  },
  {
    id: 'notif-2',
    title: 'High Wind Warning: Double-Base Cones Required',
    message: 'National Weather Service warning for Bay Area highway passes. Sustained crosswinds of 32 mph with gusts up to 45 mph. Double-weight all 28-inch traffic cones with 12lb rubber bases.',
    type: 'safety',
    createdAt: '2026-10-16T18:00:00Z',
    targetUserId: 'all',
    read: true,
    acknowledged: true,
    acknowledgedAt: '2026-10-16T19:15:00Z',
    senderName: 'Safety Department',
  },
  {
    id: 'notif-3',
    title: 'I-880 Night Paving Rolling Slowdown Confirmed',
    message: 'Caltrans District 4 approved permit amendment for I-880 Southbound. CHP escort will initiate rolling block at 22:00 sharp. All TMA units must be in echelon position by 21:45.',
    type: 'dispatch',
    createdAt: '2026-10-16T14:15:00Z',
    targetUserId: 'all',
    read: true,
    acknowledged: false,
    senderName: 'Caltrans District 4 Liaison',
  },
];

// Initial Seed Time Entries
const INITIAL_TIME_ENTRIES: TimeEntry[] = [
  {
    id: 'te-101',
    userId: 'usr-member-1',
    userName: 'Maria Rodriguez',
    jobId: 'job-104',
    jobNumber: 'WZ-104',
    jobTitle: 'US-101 NB Night Lane Closure MP 44-48',
    task: 'Travel Time',
    startTime: '2026-10-16T05:30:00Z',
    endTime: '2026-10-16T06:30:00Z',
    durationMinutes: 60,
    notes: 'Transported TMA unit and cone trailer from Yard 1 to MP 44 staging area.',
    status: 'approved',
    date: '2026-10-16',
  },
  {
    id: 'te-102',
    userId: 'usr-member-1',
    userName: 'Maria Rodriguez',
    jobId: 'job-104',
    jobNumber: 'WZ-104',
    jobTitle: 'US-101 NB Night Lane Closure MP 44-48',
    task: 'Meeting',
    startTime: '2026-10-16T06:30:00Z',
    endTime: '2026-10-16T07:00:00Z',
    durationMinutes: 30,
    notes: 'Tailgate safety briefing and JHA review with Caltrans inspector.',
    status: 'approved',
    date: '2026-10-16',
  },
  {
    id: 'te-103',
    userId: 'usr-member-1',
    userName: 'Maria Rodriguez',
    jobId: 'job-104',
    jobNumber: 'WZ-104',
    jobTitle: 'US-101 NB Night Lane Closure MP 44-48',
    task: 'Job Site',
    startTime: '2026-10-16T07:00:00Z',
    endTime: '2026-10-16T15:30:00Z',
    durationMinutes: 510,
    notes: 'Maintained 2-lane right closure. Supervised flagger stations and arrow board.',
    status: 'approved',
    date: '2026-10-16',
  },
  {
    id: 'te-104',
    userId: 'usr-member-2',
    userName: 'Sam Jenkins',
    jobId: 'job-104',
    jobNumber: 'WZ-104',
    jobTitle: 'US-101 NB Night Lane Closure MP 44-48',
    task: 'Job Site',
    startTime: '2026-10-16T06:45:00Z',
    endTime: '2026-10-16T15:15:00Z',
    durationMinutes: 510,
    notes: 'Stationed at North taper buffer. Handled radio communications with CHP.',
    status: 'submitted',
    date: '2026-10-16',
  },
];

// Initial Seed Google Meet Meetings (Team & 1 on 1)
const INITIAL_MEETINGS: GoogleMeetMeeting[] = [
  {
    id: 'meet-1',
    spaceName: 'spaces/tailgate-briefing-us101',
    meetingUri: 'https://meet.google.com/hbm-rvqj-xkz',
    meetingCode: 'hbm-rvqj-xkz',
    title: 'Daily Tailgate Safety Sync & Taper Inspection',
    meetingType: 'team',
    scheduledTime: 'Today, 06:00 AM PST',
    durationMinutes: 20,
    status: 'live',
    agenda: 'MUTCD Chapter 6 lane closure geometry, live traffic hazards on US-101 NB, and TMA truck standoff spacing review.',
    createdByUserId: 'usr-admin-1',
    createdByUserName: 'Marcus Vance (Safety Director)',
    createdAt: '2026-10-17T06:00:00Z',
  },
  {
    id: 'meet-2',
    spaceName: 'spaces/tcs-sync-maria',
    meetingUri: 'https://meet.google.com/qpt-smnk-zcw',
    meetingCode: 'qpt-smnk-zcw',
    title: '1-on-1 TCS Performance & Night Shift Prep',
    meetingType: '1on1',
    targetAttendeeName: 'Maria Rodriguez (TCS Technician)',
    targetAttendeeId: 'usr-mem-1',
    scheduledTime: 'Today, 04:30 PM PST',
    durationMinutes: 15,
    status: 'scheduled',
    agenda: 'Review recent Caltrans inspection report, discuss flagger rotation scheduling, and inspect backup LED wand supply.',
    createdByUserId: 'usr-admin-1',
    createdByUserName: 'Marcus Vance (Safety Director)',
    createdAt: '2026-10-17T07:15:00Z',
  },
  {
    id: 'meet-3',
    spaceName: 'spaces/caltrans-dot-night',
    meetingUri: 'https://meet.google.com/jdf-wtpr-mva',
    meetingCode: 'jdf-wtpr-mva',
    title: 'Caltrans District 4 Night Ramp Closure Coordination',
    meetingType: 'team',
    scheduledTime: 'Tomorrow, 07:00 PM PST',
    durationMinutes: 30,
    status: 'scheduled',
    agenda: 'Coordinate CHP highway patrol escort timing, arrow board synchronization, and detour signage along Station 42.',
    createdByUserId: 'usr-admin-1',
    createdByUserName: 'Marcus Vance (Safety Director)',
    createdAt: '2026-10-17T08:00:00Z',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // LocalStorage hydration with defaults
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('wzos_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('wzos_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default to Maria Rodriguez (Member) for instant deskless field worker experience
    return INITIAL_USERS[1];
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('wzos_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('wzos_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [formTemplates, setFormTemplates] = useState<FieldFormTemplate[]>(() => {
    const saved = localStorage.getItem('wzos_form_templates');
    return saved ? JSON.parse(saved) : INITIAL_FORMS;
  });

  const [formSubmissions, setFormSubmissions] = useState<FormSubmission[]>(() => {
    const saved = localStorage.getItem('wzos_form_submissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('wzos_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [meetings, setMeetings] = useState<GoogleMeetMeeting[]>(() => {
    const saved = localStorage.getItem('wzos_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    const saved = localStorage.getItem('wzos_time_entries');
    return saved ? JSON.parse(saved) : INITIAL_TIME_ENTRIES;
  });

  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(() => {
    const saved = localStorage.getItem('wzos_active_entry');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ActiveNavTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const tabParam = urlParams.get('tab') as ActiveNavTab;
        const validTabs: ActiveNavTab[] = [
          'dashboard',
          'clock',
          'timesheets',
          'nav',
          'jobs',
          'contacts',
          'forms',
          'notifications',
          'training',
          'meetings',
          'atlas',
        ];
        if (tabParam && validTabs.includes(tabParam)) {
          return tabParam;
        }
      } catch (e) {
        console.warn('Failed to parse URL tab param:', e);
      }
    }
    return 'dashboard';
  });
  const [selectedJobForNav, setSelectedJobForNav] = useState<Job | null>(null);
  const [isAndroidViewFrame, setIsAndroidViewFrame] = useState<boolean>(true);

  // Offline and cellular service state
  const [browserOnline, setBrowserOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [simulatedSyncError, setSimulatedSyncError] = useState<boolean>(false);
  const [syncErrorMessage, setSyncErrorMessage] = useState<string | null>(null);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(() => {
    const queue = localStorage.getItem('wzos_offline_sync_queue');
    return queue ? JSON.parse(queue).length : 0;
  });
  const [lastSyncTime, setLastSyncTime] = useState<string>('Cached (Up to date)');

  const isOnline = browserOnline && !isSimulatedOffline;

  // Visual Sync Status Tracking for Time Clock Entries and Forms ('Synced' | 'Queued' | 'Error')
  const queuedTimeEntriesCount = timeEntries.filter((e) => e.syncStatus === 'queued').length;
  const errorTimeEntriesCount = timeEntries.filter((e) => e.syncStatus === 'error').length;
  const queuedFormsCount = formSubmissions.filter((f) => f.status === 'pending' || f.syncStatus === 'queued').length;
  const errorFormsCount = formSubmissions.filter((f) => f.syncStatus === 'error').length;

  const errorCount = errorTimeEntriesCount + errorFormsCount + (simulatedSyncError ? 1 : 0);

  const timeClockSyncState: FieldSyncState =
    errorTimeEntriesCount > 0 || (simulatedSyncError && queuedTimeEntriesCount > 0)
      ? 'Error'
      : queuedTimeEntriesCount > 0
      ? 'Queued'
      : 'Synced';

  const formSyncState: FieldSyncState =
    errorFormsCount > 0 || (simulatedSyncError && queuedFormsCount > 0)
      ? 'Error'
      : queuedFormsCount > 0
      ? 'Queued'
      : 'Synced';

  const overallSyncState: FieldSyncState =
    timeClockSyncState === 'Error' || formSyncState === 'Error' || (simulatedSyncError && (queuedTimeEntriesCount > 0 || queuedFormsCount > 0 || offlineQueueCount > 0))
      ? 'Error'
      : timeClockSyncState === 'Queued' || formSyncState === 'Queued' || offlineQueueCount > 0
      ? 'Queued'
      : 'Synced';

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('wzos_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('wzos_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('wzos_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('wzos_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem('wzos_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('wzos_form_templates', JSON.stringify(formTemplates));
  }, [formTemplates]);

  useEffect(() => {
    localStorage.setItem('wzos_form_submissions', JSON.stringify(formSubmissions));
  }, [formSubmissions]);

  useEffect(() => {
    localStorage.setItem('wzos_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('wzos_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('wzos_time_entries', JSON.stringify(timeEntries));
  }, [timeEntries]);

  useEffect(() => {
    if (activeEntry) {
      localStorage.setItem('wzos_active_entry', JSON.stringify(activeEntry));
    } else {
      localStorage.removeItem('wzos_active_entry');
    }
  }, [activeEntry]);

  // Active Clock live timer calculation
  useEffect(() => {
    if (!activeEntry) {
      setActiveSeconds(0);
      return;
    }
    const updateTime = () => {
      const startMs = new Date(activeEntry.startTime).getTime();
      const nowMs = Date.now();
      const diffSec = Math.max(0, Math.floor((nowMs - startMs) / 1000));
      setActiveSeconds(diffSec);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [activeEntry]);

  // Audio / tactile feedback using Web Audio API synthesis
  const playBeep = useCallback((type: 'punch' | 'alert' | 'success' = 'punch') => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'punch') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.14);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, ctx.currentTime);
        osc.frequency.setValueAtTime(450, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }

      // Haptic feedback if available on mobile
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(type === 'alert' ? [100, 50, 100] : 60);
      }
    } catch {
      // AudioContext policy fallback
    }
  }, []);

  // Authentication Handlers
  const login = (username: string, password?: string): boolean => {
    const cleanUsername = username.trim().toLowerCase();
    const found = users.find(
      (u) => u.username.toLowerCase() === cleanUsername && (!password || u.password === password)
    );
    if (found) {
      setCurrentUser(found);
      playBeep('success');
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    playBeep('alert');
  };

  const switchUserRole = (role: 'admin' | 'member') => {
    const target = users.find((u) => u.role === role);
    if (target) {
      setCurrentUser(target);
      playBeep('success');
    }
  };

  const addUser = (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const created: User = {
      ...newUser,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setUsers((prev) => [...prev, created]);
    playBeep('success');
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...updates } : u)));
    if (currentUser?.id === id) {
      setCurrentUser((prev) => (prev ? { ...prev, ...updates } : null));
    }
    playBeep('success');
  };

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
    if (currentUser?.id === id) {
      setCurrentUser(null);
    }
  };

  // Clock In / Out Handlers
  const clockIn = (jobId: string, task: TaskCategory, notes: string = '') => {
    if (!currentUser) return;
    const job = jobs.find((j) => j.id === jobId);
    const nowIso = new Date().toISOString();
    const todayStr = new Date().toISOString().split('T')[0];

    const newEntry: TimeEntry = {
      id: `te-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      jobId: job ? job.id : jobId,
      jobNumber: job ? job.jobNumber : 'WZ-GEN',
      jobTitle: job ? job.title : 'Field Assignment',
      task,
      startTime: nowIso,
      endTime: null,
      durationMinutes: 0,
      notes,
      status: 'submitted',
      date: todayStr,
      syncStatus: isOnline ? 'synced' : 'queued',
    };

    setActiveEntry(newEntry);
    playBeep('punch');
  };

  const clockOut = (notes?: string) => {
    if (!activeEntry) return;
    const endIso = new Date().toISOString();
    const startMs = new Date(activeEntry.startTime).getTime();
    const endMs = new Date(endIso).getTime();
    const minutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));

    const completed: TimeEntry = {
      ...activeEntry,
      endTime: endIso,
      durationMinutes: minutes,
      notes: notes !== undefined ? notes : activeEntry.notes,
      status: 'submitted',
      syncStatus: isOnline ? 'synced' : 'queued',
    };

    setTimeEntries((prev) => [completed, ...prev]);
    setActiveEntry(null);
    playBeep('punch');
  };

  const switchTask = (newTask: TaskCategory, notes?: string) => {
    if (!activeEntry) return;
    const nowIso = new Date().toISOString();
    const startMs = new Date(activeEntry.startTime).getTime();
    const endMs = new Date(nowIso).getTime();
    const minutes = Math.max(1, Math.round((endMs - startMs) / (1000 * 60)));

    // Close previous task entry
    const previousCompleted: TimeEntry = {
      ...activeEntry,
      endTime: nowIso,
      durationMinutes: minutes,
      notes: notes !== undefined ? notes : activeEntry.notes,
      status: 'submitted',
      syncStatus: isOnline ? 'synced' : 'queued',
    };

    // Open new task entry under same job
    const nextEntry: TimeEntry = {
      id: `te-${Date.now()}`,
      userId: activeEntry.userId,
      userName: activeEntry.userName,
      jobId: activeEntry.jobId,
      jobNumber: activeEntry.jobNumber,
      jobTitle: activeEntry.jobTitle,
      task: newTask,
      startTime: nowIso,
      endTime: null,
      durationMinutes: 0,
      notes: `Switched from ${activeEntry.task}`,
      status: 'submitted',
      date: new Date().toISOString().split('T')[0],
      syncStatus: isOnline ? 'synced' : 'queued',
    };

    setTimeEntries((prev) => [previousCompleted, ...prev]);
    setActiveEntry(nextEntry);
    playBeep('punch');
  };

  // Time Entry Management (Admins edit/add/delete)
  const addManualTimeEntry = (entry: Omit<TimeEntry, 'id'>) => {
    const created: TimeEntry = {
      ...entry,
      id: `te-manual-${Date.now()}`,
      editedByAdmin: currentUser?.role === 'admin',
      editedAt: new Date().toISOString(),
    };
    setTimeEntries((prev) => [created, ...prev]);
    playBeep('success');
  };

  const updateTimeEntry = (id: string, updates: Partial<TimeEntry>) => {
    setTimeEntries((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          return {
            ...e,
            ...updates,
            editedByAdmin: currentUser?.role === 'admin',
            editedAt: new Date().toISOString(),
          };
        }
        return e;
      })
    );
    playBeep('success');
  };

  const deleteTimeEntry = (id: string) => {
    setTimeEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const approveTimeEntry = (id: string) => {
    setTimeEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status: 'approved' as const } : e))
    );
    playBeep('success');
  };

  // Job CRUD
  const addJob = (job: Omit<Job, 'id'>) => {
    const created: Job = {
      ...job,
      id: `job-${Date.now()}`,
    };
    setJobs((prev) => [created, ...prev]);
    playBeep('success');
  };

  const updateJob = (id: string, updates: Partial<Job>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...updates } : j)));
    playBeep('success');
  };

  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id));
  };

  // Contacts CRUD
  const addContact = (contact: Omit<Contact, 'id'>) => {
    const created: Contact = {
      ...contact,
      id: `cnt-${Date.now()}`,
    };
    setContacts((prev) => [...prev, created]);
    playBeep('success');
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    playBeep('success');
  };

  const deleteContact = (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));
  };

  const bulkImportContacts = (newContacts: Omit<Contact, 'id'>[]) => {
    const formatted: Contact[] = newContacts.map((c, idx) => ({
      ...c,
      id: `cnt-imp-${Date.now()}-${idx}`,
    }));
    setContacts((prev) => [...prev, ...formatted]);
    playBeep('success');
  };

  // Forms
  const addFormTemplate = (template: Omit<FieldFormTemplate, 'id'>) => {
    const created: FieldFormTemplate = {
      ...template,
      id: `form-custom-${Date.now()}`,
      isCustom: true,
    };
    setFormTemplates((prev) => [...prev, created]);
    playBeep('success');
  };

  const deleteFormTemplate = (id: string) => {
    setFormTemplates((prev) => prev.filter((f) => f.id !== id));
  };

  // Offline Queue Synchronization
  const syncOfflineQueue = useCallback(() => {
    if (simulatedSyncError) {
      // Simulate network / gateway failure
      setSyncErrorMessage('Dispatch Gateway Timeout (504): Work Zone Relay Unreachable');
      setTimeEntries((prev) =>
        prev.map((e) => (e.syncStatus === 'queued' ? { ...e, syncStatus: 'error' } : e))
      );
      setFormSubmissions((prev) =>
        prev.map((s) =>
          s.status === 'pending' || s.syncStatus === 'queued' ? { ...s, syncStatus: 'error' } : s
        )
      );
      playBeep('alert');
      return;
    }

    setSyncErrorMessage(null);

    // Sync all time entries marked queued or error
    setTimeEntries((prev) =>
      prev.map((e) => (e.syncStatus === 'queued' || e.syncStatus === 'error' ? { ...e, syncStatus: 'synced' } : e))
    );

    // Sync all forms marked pending/queued or error
    setFormSubmissions((prev) =>
      prev.map((sub) =>
        sub.status === 'pending' || sub.syncStatus === 'queued' || sub.syncStatus === 'error'
          ? { ...sub, status: 'delivered' as const, syncStatus: 'synced' as const }
          : sub
      )
    );

    localStorage.removeItem('wzos_offline_sync_queue');
    setOfflineQueueCount(0);
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    playBeep('success');

    // Dispatch shift notification
    const newNotif: NotificationItem = {
      id: `notif-sync-${Date.now()}`,
      title: 'Offline Field Data Synced to Dispatch',
      message: 'Successfully synchronized pending time clock entries and safety compliance forms with dispatch servers.',
      type: 'dispatch',
      createdAt: new Date().toISOString(),
      read: false,
      acknowledged: false,
      senderName: 'Local Storage Sync Engine',
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, [simulatedSyncError, playBeep]);

  // Monitor network connectivity and auto-sync when cell signal returns
  useEffect(() => {
    const handleOnline = () => {
      setBrowserOnline(true);
      if (!isSimulatedOffline) {
        syncOfflineQueue();
      }
    };
    const handleOffline = () => {
      setBrowserOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline, syncOfflineQueue]);

  // Auto-sync when toggling back online from simulated mode
  useEffect(() => {
    if (!isSimulatedOffline && browserOnline) {
      syncOfflineQueue();
    }
  }, [isSimulatedOffline, browserOnline, syncOfflineQueue]);

  const submitForm = (submission: Omit<FormSubmission, 'id' | 'submittedAt'>) => {
    const isCurrentlyOnline = browserOnline && !isSimulatedOffline;

    const created: FormSubmission = {
      ...submission,
      id: `sub-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: isCurrentlyOnline ? 'delivered' : 'pending',
      syncStatus: isCurrentlyOnline ? 'synced' : 'queued',
    };

    setFormSubmissions((prev) => [created, ...prev]);

    if (!isCurrentlyOnline) {
      // Add to offline sync queue in localStorage
      const existingQueue = JSON.parse(localStorage.getItem('wzos_offline_sync_queue') || '[]');
      existingQueue.push(created);
      localStorage.setItem('wzos_offline_sync_queue', JSON.stringify(existingQueue));
      setOfflineQueueCount(existingQueue.length);
      playBeep('alert');
    } else {
      playBeep('success');
    }
  };

  const queueSampleOfflinePunch = () => {
    if (!currentUser) return;
    const testEntry: TimeEntry = {
      id: `te-offline-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      jobId: jobs[0]?.id || 'job-104',
      jobNumber: jobs[0]?.jobNumber || 'WZ-104',
      jobTitle: jobs[0]?.title || 'US-101 Night Lane Closure',
      task: 'Job Site',
      startTime: new Date(Date.now() - 3600000).toISOString(),
      endTime: new Date().toISOString(),
      durationMinutes: 60,
      notes: 'Offline emergency taper inspection punch',
      status: 'submitted',
      date: new Date().toISOString().split('T')[0],
      syncStatus: 'queued',
    };
    setTimeEntries((prev) => [testEntry, ...prev]);
    playBeep('alert');
  };

  const queueSampleOfflineForm = () => {
    if (!currentUser) return;
    const testForm: FormSubmission = {
      id: `sub-offline-${Date.now()}`,
      formId: 'form-mutcd-inspection',
      formTitle: 'Daily Work Zone MUTCD Inspection & Sign Log',
      submittedByUserId: currentUser.id,
      submittedByName: currentUser.name,
      jobId: jobs[0]?.id,
      jobNumber: jobs[0]?.jobNumber,
      destination: 'safety@superiorllc.org',
      submittedAt: new Date().toISOString(),
      data: {
        shift_time: 'Active Shift Check',
        taper_length: true,
        signs_clean: true,
        arrow_board_mode: 'Left Flashing Arrow',
        tma_standoff_distance: 120,
        weather_conditions: 'Clear Daylight',
        inspector_notes: 'Offline cached safety audit during tunnel dead zone.',
      },
      status: 'pending',
      syncStatus: 'queued',
    };
    setFormSubmissions((prev) => [testForm, ...prev]);
    playBeep('alert');
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const acknowledgeNotification = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              read: true,
              acknowledged: true,
              acknowledgedAt: new Date().toISOString(),
            }
          : n
      )
    );
    playBeep('success');
  };

  const addNotification = (
    notification: Omit<NotificationItem, 'id' | 'createdAt' | 'read' | 'acknowledged'>
  ) => {
    const created: NotificationItem = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
      read: false,
      acknowledged: false,
    };
    setNotifications((prev) => [created, ...prev]);
    playBeep('alert');
  };

  // Google Meet Meeting Management (Admins create, all view & join)
  const addMeeting = (meeting: Omit<GoogleMeetMeeting, 'id' | 'createdAt'>) => {
    const created: GoogleMeetMeeting = {
      ...meeting,
      id: `meet-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setMeetings((prev) => [created, ...prev]);

    // Automatically post a notification to alert the crew
    const notifTitle =
      created.meetingType === '1on1'
        ? `1-on-1 Google Meet Scheduled: ${created.title}`
        : `Team Google Meet: ${created.title}`;

    const notifMsg = `Google Meet video space ready (${created.meetingCode}). Time: ${created.scheduledTime}. Tap to view and join.`;

    const newNotif: NotificationItem = {
      id: `notif-meet-${Date.now()}`,
      title: notifTitle,
      message: notifMsg,
      type: 'dispatch',
      createdAt: new Date().toISOString(),
      read: false,
      acknowledged: false,
      senderName: created.createdByUserName || 'Safety & Operations',
      shiftDate: created.scheduledTime,
      targetUserId: created.targetAttendeeId || 'all',
      targetUserName: created.targetAttendeeName,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    playBeep('success');
  };

  const updateMeeting = (id: string, updates: Partial<GoogleMeetMeeting>) => {
    setMeetings((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
    playBeep('punch');
  };

  const deleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    playBeep('alert');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        login,
        logout,
        switchUserRole,
        addUser,
        updateUser,
        deleteUser,
        activeEntry,
        activeSeconds,
        clockIn,
        clockOut,
        switchTask,
        timeEntries,
        addManualTimeEntry,
        updateTimeEntry,
        deleteTimeEntry,
        approveTimeEntry,
        jobs,
        addJob,
        updateJob,
        deleteJob,
        contacts,
        addContact,
        updateContact,
        deleteContact,
        bulkImportContacts,
        formTemplates,
        addFormTemplate,
        deleteFormTemplate,
        formSubmissions,
        submitForm,
        notifications,
        markNotificationRead,
        acknowledgeNotification,
        addNotification,
        meetings,
        addMeeting,
        updateMeeting,
        deleteMeeting,
        activeTab,
        setActiveTab,
        selectedJobForNav,
        setSelectedJobForNav,
        isAndroidViewFrame,
        setIsAndroidViewFrame,
        isOnline,
        isSimulatedOffline,
        setIsSimulatedOffline,
        offlineQueueCount,
        syncOfflineQueue,
        lastSyncTime,
        timeClockSyncState,
        formSyncState,
        overallSyncState,
        queuedTimeEntriesCount,
        queuedFormsCount,
        errorCount,
        syncErrorMessage,
        simulatedSyncError,
        setSimulatedSyncError,
        queueSampleOfflinePunch,
        queueSampleOfflineForm,
        playBeep,
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
