import { useState } from 'react';
import { Bell, Filter, Trash2, Eye, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import type { Alert, AlertType, SiteId, SiteState } from '@/types/energy';

interface AlertCenterProps {
  alerts: Alert[];
  activeSite: SiteId;
  allSites: Record<SiteId, SiteState>;
  onClearAlerts: () => void;
}

type FilterType = 'all' | AlertType;

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'SOC_LOW', label: 'SOC 低' },
  { value: 'SOC_LOW_PROTECT', label: 'SOC 保護' },
  { value: 'GREEN_SHORTAGE', label: '綠電不足' },
  { value: 'SOURCE_SWITCH', label: '切換紀錄' },
  { value: 'FLEET_SWITCH', label: '全廠調度' },
];

function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function AlertItem({ alert, expanded, onToggle }: { alert: Alert; expanded: boolean; onToggle: () => void }) {
  const severityIcon = {
    info: <Info className="w-3.5 h-3.5 text-data-blue" />,
    warning: <AlertTriangle className="w-3.5 h-3.5 text-warning-amber" />,
    critical: <AlertCircle className="w-3.5 h-3.5 text-critical-red" />,
  };

  const severityClass = {
    info: 'alert-info',
    warning: 'alert-warning',
    critical: 'alert-critical',
  };

  return (
    <div className={`alert-item ${severityClass[alert.severity]}`}>
      <button
        onClick={onToggle}
        className="w-full text-left"
      >
        <div className="flex items-start gap-2">
          {severityIcon[alert.severity]}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-mono text-muted-foreground">{formatTime(alert.time)}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-secondary font-medium">
                Site {alert.site}
              </span>
            </div>
            <p className="text-xs mt-1 text-foreground/90 truncate">{alert.message}</p>
          </div>
          {alert.details && (
            expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
      </button>

      {expanded && alert.details && (
        <div className="mt-2 pt-2 border-t border-border/30 grid grid-cols-2 gap-2 text-[10px]">
          {alert.details.soc !== undefined && (
            <div>
              <span className="text-muted-foreground">SOC:</span>
              <span className="ml-1 font-mono">{alert.details.soc.toFixed(1)}%</span>
            </div>
          )}
          {alert.details.solarOutput !== undefined && (
            <div>
              <span className="text-muted-foreground">Solar:</span>
              <span className="ml-1 font-mono">{alert.details.solarOutput.toFixed(1)} kW</span>
            </div>
          )}
          {alert.details.totalLoad !== undefined && (
            <div>
              <span className="text-muted-foreground">Total:</span>
              <span className="ml-1 font-mono">{alert.details.totalLoad.toFixed(1)} kW</span>
            </div>
          )}
          {alert.details.greenLoad !== undefined && (
            <div>
              <span className="text-muted-foreground">Green:</span>
              <span className="ml-1 font-mono">{alert.details.greenLoad.toFixed(1)} kW</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AlertCenter({ alerts, activeSite, allSites, onClearAlerts }: AlertCenterProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAllSites, setShowAllSites] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Combine all alerts if showing all sites
  const allAlerts = showAllSites
    ? Object.entries(allSites)
        .flatMap(([siteId, site]) => site.alerts.map(a => ({ ...a, site: siteId as SiteId })))
        .sort((a, b) => b.time.getTime() - a.time.getTime())
    : alerts;

  const filteredAlerts = filter === 'all'
    ? allAlerts
    : allAlerts.filter(a => a.type === filter || (filter === 'SOC_LOW' && a.type === 'SOC_LOW_PROTECT'));

  const criticalCount = allAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = allAlerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="glass-card-dark p-4 flex flex-col h-full max-h-[400px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">告警中心</span>
          {criticalCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-critical-red/20 text-critical-red font-bold animate-pulse">
              {criticalCount}
            </span>
          )}
          {warningCount > 0 && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-warning-amber/20 text-warning-amber font-bold">
              {warningCount}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAllSites(!showAllSites)}
            className={`p-1.5 rounded-lg transition-colors ${
              showAllSites ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
            title={showAllSites ? '顯示當前站點' : '顯示全部站點'}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClearAlerts}
            className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-destructive transition-colors"
            title="清除事件"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-colors ${
              filter === opt.value
                ? 'bg-primary/20 text-primary'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Site indicator */}
      <div className="text-[10px] text-muted-foreground mb-2">
        {showAllSites ? '顯示全部站點' : `Site ${activeSite}`} · {filteredAlerts.length} 筆事件
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="w-8 h-8 mb-2 opacity-30" />
            <span className="text-xs">暫無告警事件</span>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <AlertItem
              key={alert.id}
              alert={alert}
              expanded={expandedId === alert.id}
              onToggle={() => setExpandedId(expandedId === alert.id ? null : alert.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
