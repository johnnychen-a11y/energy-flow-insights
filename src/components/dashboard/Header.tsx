import { Sun, Battery, Zap, Thermometer, Activity } from 'lucide-react';
import type { SiteId } from '@/types/energy';

interface HeaderProps {
  activeSite: SiteId;
  solarOutput: number;
  batteryLevel: number;
  batteryTemp: number;
  totalLoad: number;
  greenLoad: number;
}

export function Header({ activeSite, solarOutput, batteryLevel, batteryTemp, totalLoad, greenLoad }: HeaderProps) {
  return (
    <header className="glass-card p-4 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">智慧工廠能源流向與數據監控</h1>
            <p className="text-xs text-muted-foreground">Energy & Data Flow Dashboard · Site {activeSite}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-solar-yellow/10 border border-solar-yellow/30">
            <Sun className="w-4 h-4 text-solar-yellow" />
            <span className="font-mono text-sm text-solar-yellow">{solarOutput.toFixed(1)} kW</span>
          </div>

          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
            batteryLevel <= 5 ? 'bg-critical-red/10 border-critical-red/30' :
            batteryLevel < 20 ? 'bg-warning-amber/10 border-warning-amber/30' :
            'bg-green-energy/10 border-green-energy/30'
          }`}>
            <Battery className={`w-4 h-4 ${
              batteryLevel <= 5 ? 'text-critical-red' :
              batteryLevel < 20 ? 'text-warning-amber' :
              'text-green-energy'
            }`} />
            <span className={`font-mono text-sm ${
              batteryLevel <= 5 ? 'text-critical-red' :
              batteryLevel < 20 ? 'text-warning-amber' :
              'text-green-energy'
            }`}>{batteryLevel.toFixed(1)}%</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
            <Activity className="w-4 h-4 text-foreground" />
            <span className="font-mono text-sm">{totalLoad.toFixed(1)} kW</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-energy/10 border border-green-energy/30">
            <Zap className="w-4 h-4 text-green-energy" />
            <span className="font-mono text-sm text-green-energy">{greenLoad.toFixed(1)} kW</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary border border-border">
            <Thermometer className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-sm">{batteryTemp.toFixed(1)}°C</span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-border/50 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-solar-yellow rounded-full" />
          <span>充電流</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-green-energy rounded-full" />
          <span>綠電流</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-grid-orange rounded-full" />
          <span>市電流</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-data-blue rounded-full border-dashed border border-data-blue" />
          <span>資料流</span>
        </div>
      </div>
    </header>
  );
}
