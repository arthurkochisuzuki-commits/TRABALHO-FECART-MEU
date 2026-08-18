export type RoleType = 'owner' | 'resident' | 'employee' | 'guest';

export interface Resident {
  id: string;
  name: string;
  role: RoleType;
  roleLabel: string;
  unitCode: string;
  photoUrl: string;
  status: 'active' | 'inactive';
  expiresAt?: string;
  createdAt: string;
  lastSeen?: string;
  lastLocation?: string;
  confidenceAverage?: number;
}

export type AlertType = 'unauthorized' | 'authorized' | 'camera_offline' | 'system_sync';

export interface SecurityAlert {
  id: string;
  timestamp: string;
  date: string;
  type: AlertType;
  title: string;
  cameraCode: string;
  cameraLocation: string;
  residentName?: string;
  residentAvatar?: string;
  residentRole?: string;
  confidence?: number;
  confidenceLabel?: string;
  status: 'active' | 'escalated' | 'resolved';
  snapshotUrl?: string;
  description?: string;
  details?: string;
}

export interface CameraFeed {
  id: string;
  code: string;
  name: string;
  location: string;
  status: 'online' | 'offline' | 'warning';
  fps: number;
  resolution: string;
  streamImage: string;
  hasUnknownDetection?: boolean;
  detectedName?: string;
  confidenceScore?: number;
}

export type PrimaryColor = 'cyan' | 'blue' | 'slate' | 'red';
export type DataDensity = 'compact' | 'relaxed';

export interface SystemConfig {
  density: DataDensity;
  primaryColor: PrimaryColor;
  developerMode: boolean;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  yoloEngineActive: boolean;
  yoloConfidence: number; // e.g. 0.85
  webhooksEnabled: boolean;
  debugLogsEnabled: boolean;
  soundAlarmsEnabled: boolean;
  modelConfigJson: string;
}
