export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  position: string;
  phone: string;
  employeeId: string;
  avatarUrl?: string;
  createdAt: string;
}

export type TaskCategory = 'Travel Time' | 'Job Site' | 'Meeting' | 'Other';

export interface Job {
  id: string;
  jobNumber: string;
  title: string;
  client: string;
  locationName: string;
  address: string;
  coordinates: [number, number]; // [lat, lng]
  closureType: string;
  status: 'active' | 'scheduled' | 'completed';
  assignedMemberIds: string[];
  safetyNotes: string;
  speedLimit: number;
  startDate: string;
}

export type FieldSyncState = 'Synced' | 'Queued' | 'Error';

export interface TimeEntry {
  id: string;
  userId: string;
  userName: string;
  jobId: string;
  jobNumber: string;
  jobTitle: string;
  task: TaskCategory;
  startTime: string; // ISO
  endTime: string | null; // ISO or null if active
  durationMinutes: number;
  notes: string;
  status: 'submitted' | 'approved' | 'flagged';
  date: string; // YYYY-MM-DD
  editedByAdmin?: boolean;
  editedAt?: string;
  syncStatus?: 'synced' | 'queued' | 'error';
}

export interface Contact {
  id: string;
  name: string;
  position: string;
  phone: string;
  department: string;
  isEmergency?: boolean;
  notes?: string;
}

export type FormFieldType = 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'signature';

export interface FormFieldDefinition {
  id: string;
  label: string;
  type: FormFieldType;
  options?: string[];
  required: boolean;
  placeholder?: string;
  defaultValue?: string | boolean | number;
}

export interface FieldFormTemplate {
  id: string;
  title: string;
  category: 'Safety' | 'Inspection' | 'Equipment' | 'Incident' | 'Custom';
  description: string;
  destination: string;
  isCustom?: boolean;
  fields: FormFieldDefinition[];
}

export interface FormSubmission {
  id: string;
  formId: string;
  formTitle: string;
  submittedByUserId: string;
  submittedByName: string;
  jobId?: string;
  jobNumber?: string;
  destination: string;
  submittedAt: string;
  data: Record<string, any>;
  signatureData?: string; // base64 or drawn signature
  status: 'delivered' | 'pending' | 'archived';
  syncStatus?: 'synced' | 'queued' | 'error';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'assignment' | 'safety' | 'dispatch' | 'weather';
  createdAt: string;
  targetUserId?: string; // 'all' or userId
  targetUserName?: string;
  shiftDate?: string;
  read: boolean;
  acknowledged: boolean;
  acknowledgedAt?: string;
  senderName: string;
}

export interface GoogleMeetMeeting {
  id: string;
  spaceName?: string;
  meetingUri: string;
  meetingCode: string;
  title: string;
  meetingType: 'team' | '1on1';
  targetAttendeeName?: string;
  targetAttendeeId?: string;
  scheduledTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'live' | 'ended';
  agenda?: string;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
}

export type ActiveNavTab = 'dashboard' | 'clock' | 'timesheets' | 'jobs' | 'nav' | 'contacts' | 'forms' | 'notifications' | 'training' | 'meetings' | 'atlas' | 'admin';
