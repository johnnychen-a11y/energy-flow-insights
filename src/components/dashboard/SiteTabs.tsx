import type { SiteId, SiteState } from '@/types/energy';
import { Factory, AlertTriangle, AlertCircle } from 'lucide-react';

interface SiteTabsProps {
  activeSite: SiteId;
  sites: Record<SiteId, SiteState>;
  onSiteChange: (site: SiteId) => void;
}

const SITES: SiteId[] = ['A', 'B', 'C'];

function getSiteStatus(site: SiteState): 'normal' | 'warning' | 'critical' {
  if (site.batteryLevel <= 5) return 'critical';
  if (site.batteryLevel < 20) return 'warning';
  return 'normal';
}

export function SiteTabs({ activeSite, sites, onSiteChange }: SiteTabsProps) {
  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Tab buttons */}
      <div className="flex gap-2">
        {SITES.map(siteId => {
          const isActive = activeSite === siteId;
          const status = getSiteStatus(sites[siteId]);

          return (
            <button
              key={siteId}
              onClick={() => onSiteChange(siteId)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
            >
              <Factory className="w-4 h-4" />
              <span>Site {siteId}</span>
              {status === 'warning' && <AlertTriangle className="w-3.5 h-3.5 text-warning-amber" />}
              {status === 'critical' && <AlertCircle className="w-3.5 h-3.5 text-critical-red animate-pulse" />}
            </button>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {SITES.map(siteId => {
          const site = sites[siteId];
          const isActive = activeSite === siteId;
          const status = getSiteStatus(site);
          const totalLoad = site.machines.reduce((sum, m) => sum + m.load, 0);
          const greenLoad = site.machines.filter(m => m.source === 'storage').reduce((sum, m) => sum + m.load, 0);

          return (
            <button
              key={siteId}
              onClick={() => onSiteChange(siteId)}
              className={`kpi-card min-w-[180px] flex-shrink-0 text-left ${
                isActive ? 'kpi-card-active' : ''
              } ${
                status === 'critical' ? 'kpi-card-critical' :
                status === 'warning' ? 'kpi-card-warning' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Site {siteId}</span>
                {status === 'critical' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-critical-red/20 text-critical-red font-medium">
                    危險
                  </span>
                )}
                {status === 'warning' && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning-amber/20 text-warning-amber font-medium">
                    注意
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <div>
                  <span className="text-muted-foreground">SOC</span>
                  <p className={`font-mono font-semibold ${
                    status === 'critical' ? 'text-critical-red' :
                    status === 'warning' ? 'text-warning-amber' :
                    'text-green-energy'
                  }`}>{site.batteryLevel.toFixed(1)}%</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Solar</span>
                  <p className="font-mono font-semibold text-solar-yellow">{site.solarOutput.toFixed(1)} kW</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total</span>
                  <p className="font-mono font-semibold">{totalLoad.toFixed(1)} kW</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Green</span>
                  <p className="font-mono font-semibold text-green-energy">{greenLoad.toFixed(1)} kW</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
