import { useState, useEffect, useCallback, useRef } from 'react';
import type { SiteId, SiteState, Alert, AlertType, AlertSeverity, Machine, PowerSource, CommandStatus, FleetState } from '@/types/energy';

const SITES: SiteId[] = ['A', 'B', 'C'];
const COOLDOWN_MS = 30000;

function generateMachines(): Machine[] {
  return Array.from({ length: 7 }, (_, i) => {
    const status = Math.random() > 0.3 ? 'run' : 'idle';
    const load = status === 'run' ? 5 + Math.random() * 3 : 0.5 + Math.random() * 0.5;
    const source: PowerSource = Math.random() > 0.4 ? 'storage' : 'grid';
    return { id: i + 1, status, load, source };
  });
}

function createInitialSiteState(): SiteState {
  return {
    solarOutput: 70 + Math.random() * 25,
    batteryLevel: 40 + Math.random() * 40,
    batteryTemp: 30 + Math.random() * 6,
    machines: generateMachines(),
    alerts: [],
    lastSocWarningTime: null,
    lastGreenShortageTime: null,
    socHistory: [],
  };
}

function createAlert(
  site: SiteId,
  type: AlertType,
  message: string,
  severity: AlertSeverity,
  details?: Alert['details']
): Alert {
  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    time: new Date(),
    site,
    type,
    message,
    severity,
    details,
  };
}

export function useEnergySimulation() {
  const [state, setState] = useState<FleetState>(() => ({
    sites: {
      A: createInitialSiteState(),
      B: createInitialSiteState(),
      C: createInitialSiteState(),
    },
    activeSite: 'A',
    commandStatus: 'idle',
  }));

  const commandTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setActiveSite = useCallback((site: SiteId) => {
    setState(prev => ({ ...prev, activeSite: site }));
  }, []);

  const toggleMachineSource = useCallback((machineId: number) => {
    setState(prev => {
      const site = prev.activeSite;
      const siteState = prev.sites[site];
      const machine = siteState.machines.find(m => m.id === machineId);
      if (!machine) return prev;

      const oldSource = machine.source;
      const newSource: PowerSource = oldSource === 'storage' ? 'grid' : 'storage';

      // Check if switching to storage when SOC is critically low
      if (newSource === 'storage' && siteState.batteryLevel <= 5) {
        return prev; // Prevent switching to green energy when SOC is critically low
      }

      const newMachines = siteState.machines.map(m =>
        m.id === machineId ? { ...m, source: newSource } : m
      );

      const alert = createAlert(
        site,
        'SOURCE_SWITCH',
        `CNC #${machineId}：${oldSource === 'storage' ? '綠電' : '市電'} → ${newSource === 'storage' ? '綠電' : '市電'}`,
        'info'
      );

      return {
        ...prev,
        sites: {
          ...prev.sites,
          [site]: {
            ...siteState,
            machines: newMachines,
            alerts: [alert, ...siteState.alerts].slice(0, 50),
          },
        },
      };
    });
  }, []);

  const switchAllToSource = useCallback((source: PowerSource) => {
    setState(prev => {
      if (prev.commandStatus !== 'idle') return prev;
      return { ...prev, commandStatus: 'sending' };
    });

    setTimeout(() => {
      setState(prev => ({ ...prev, commandStatus: 'processing' }));
    }, 500);

    setTimeout(() => {
      setState(prev => {
        const site = prev.activeSite;
        const siteState = prev.sites[site];

        // If switching to storage and SOC is critically low, prevent
        if (source === 'storage' && siteState.batteryLevel <= 5) {
          return { ...prev, commandStatus: 'idle' };
        }

        const newMachines = siteState.machines.map(m => ({ ...m, source }));
        const alert = createAlert(
          site,
          'FLEET_SWITCH',
          `全廠切換至${source === 'storage' ? '綠電' : '市電'}`,
          'info'
        );

        return {
          ...prev,
          commandStatus: 'success',
          sites: {
            ...prev.sites,
            [site]: {
              ...siteState,
              machines: newMachines,
              alerts: [alert, ...siteState.alerts].slice(0, 50),
            },
          },
        };
      });
    }, 1500);

    commandTimeoutRef.current = setTimeout(() => {
      setState(prev => ({ ...prev, commandStatus: 'idle' }));
    }, 3000);
  }, []);

  const clearSiteAlerts = useCallback(() => {
    setState(prev => {
      const site = prev.activeSite;
      return {
        ...prev,
        sites: {
          ...prev.sites,
          [site]: {
            ...prev.sites[site],
            alerts: [],
          },
        },
      };
    });
  }, []);

  // Simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      setState(prev => {
        const now = Date.now();
        const newSites = { ...prev.sites };

        SITES.forEach(siteId => {
          const site = { ...newSites[siteId] };
          const newAlerts: Alert[] = [];

          // Update solar output (fluctuate between 70-95 kW)
          site.solarOutput = Math.max(50, Math.min(100, site.solarOutput + (Math.random() - 0.5) * 5));

          // Update battery temp
          site.batteryTemp = Math.max(28, Math.min(40, site.batteryTemp + (Math.random() - 0.5) * 0.5));

          // Update machine loads
          site.machines = site.machines.map(m => {
            if (m.status === 'run') {
              return { ...m, load: 5 + Math.random() * 3 };
            }
            return { ...m, load: 0.5 + Math.random() * 0.5 };
          });

          // Occasionally toggle machine status
          if (Math.random() < 0.02) {
            const idx = Math.floor(Math.random() * 7);
            const newStatus = site.machines[idx].status === 'run' ? 'idle' : 'run';
            site.machines = site.machines.map((m, i) =>
              i === idx
                ? { ...m, status: newStatus, load: newStatus === 'run' ? 5 + Math.random() * 3 : 0.5 + Math.random() * 0.5 }
                : m
            );
          }

          // Calculate loads
          const totalLoad = site.machines.reduce((sum, m) => sum + m.load, 0);
          const greenLoad = site.machines.filter(m => m.source === 'storage').reduce((sum, m) => sum + m.load, 0);

          // Battery charge/discharge
          const chargeAmount = site.solarOutput * 0.05;
          const dischargeAmount = greenLoad * 0.1;
          let newSoc = site.batteryLevel + chargeAmount - dischargeAmount;
          newSoc = Math.max(0, Math.min(100, newSoc));

          // Track SOC history for trend analysis
          const socHistory = [...site.socHistory.slice(-5), newSoc];

          // SOC low protection
          if (newSoc <= 5 && site.batteryLevel > 5) {
            // Trigger protection: switch all storage machines to grid
            site.machines = site.machines.map(m =>
              m.source === 'storage' ? { ...m, source: 'grid' as PowerSource } : m
            );
            newAlerts.push(createAlert(
              siteId,
              'SOC_LOW_PROTECT',
              `電池電量嚴重不足 (${newSoc.toFixed(1)}%)，已自動切換至市電保護`,
              'critical',
              { soc: newSoc, solarOutput: site.solarOutput, totalLoad, greenLoad }
            ));
            site.lastSocWarningTime = now;
          } else if (newSoc < 20 && newSoc >= 5) {
            // SOC warning (with cooldown)
            if (!site.lastSocWarningTime || now - site.lastSocWarningTime > COOLDOWN_MS) {
              newAlerts.push(createAlert(
                siteId,
                'SOC_LOW',
                `電池電量偏低 (${newSoc.toFixed(1)}%)，建議減少綠電負載`,
                'warning',
                { soc: newSoc, solarOutput: site.solarOutput, totalLoad, greenLoad }
              ));
              site.lastSocWarningTime = now;
            }
          }

          // Green shortage detection
          if (socHistory.length >= 3) {
            const trend = socHistory[socHistory.length - 1] - socHistory[0];
            if (site.solarOutput < 75 && totalLoad > 25 && trend < -2) {
              if (!site.lastGreenShortageTime || now - site.lastGreenShortageTime > COOLDOWN_MS) {
                newAlerts.push(createAlert(
                  siteId,
                  'GREEN_SHORTAGE',
                  `綠電供應不足：太陽能 ${site.solarOutput.toFixed(1)}kW，負載 ${totalLoad.toFixed(1)}kW`,
                  'warning',
                  { soc: newSoc, solarOutput: site.solarOutput, totalLoad, greenLoad }
                ));
                site.lastGreenShortageTime = now;
              }
            }
          }

          site.batteryLevel = newSoc;
          site.socHistory = socHistory;
          site.alerts = [...newAlerts, ...site.alerts].slice(0, 50);
          newSites[siteId] = site;
        });

        return { ...prev, sites: newSites };
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (commandTimeoutRef.current) {
        clearTimeout(commandTimeoutRef.current);
      }
    };
  }, []);

  const activeSiteState = state.sites[state.activeSite];
  const totalLoad = activeSiteState.machines.reduce((sum, m) => sum + m.load, 0);
  const greenLoad = activeSiteState.machines.filter(m => m.source === 'storage').reduce((sum, m) => sum + m.load, 0);

  return {
    state,
    activeSiteState,
    totalLoad,
    greenLoad,
    setActiveSite,
    toggleMachineSource,
    switchAllToSource,
    clearSiteAlerts,
  };
}
