export type SiteId = 'A' | 'B' | 'C';

export type MachineStatus = 'run' | 'idle';
export type PowerSource = 'storage' | 'grid';

export interface Machine {
  id: number;
  status: MachineStatus;
  load: number;
  source: PowerSource;
}

export type AlertType = 'SOC_LOW' | 'SOC_LOW_PROTECT' | 'GREEN_SHORTAGE' | 'SOURCE_SWITCH' | 'FLEET_SWITCH';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
  id: string;
  time: Date;
  site: SiteId;
  type: AlertType;
  message: string;
  severity: AlertSeverity;
  details?: {
    soc?: number;
    solarOutput?: number;
    totalLoad?: number;
    greenLoad?: number;
  };
}

export interface SiteState {
  solarOutput: number;
  batteryLevel: number;
  batteryTemp: number;
  machines: Machine[];
  alerts: Alert[];
  lastSocWarningTime: number | null;
  lastGreenShortageTime: number | null;
  socHistory: number[];
}

export type CommandStatus = 'idle' | 'sending' | 'processing' | 'success';

export interface FleetState {
  sites: Record<SiteId, SiteState>;
  activeSite: SiteId;
  commandStatus: CommandStatus;
}
