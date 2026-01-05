import { Sun, Battery, Zap, PlugZap } from 'lucide-react';
import type { Machine } from '@/types/energy';

interface Layer1FieldProps {
  solarOutput: number;
  batteryLevel: number;
  machines: Machine[];
  onToggleMachine: (id: number) => void;
}

// Energy flow particle component
function EnergyParticle({ 
  color, 
  delay = 0, 
  direction = 'right',
  speed = 'normal'
}: { 
  color: 'yellow' | 'green' | 'orange' | 'blue';
  delay?: number;
  direction?: 'down' | 'right';
  speed?: 'slow' | 'normal' | 'fast';
}) {
  const colorClasses = {
    yellow: 'bg-solar-yellow',
    green: 'bg-green-energy',
    orange: 'bg-grid-orange',
    blue: 'bg-data-blue'
  };

  const glowClasses = {
    yellow: 'shadow-[0_0_8px_hsl(45_95%_55%/0.8)]',
    green: 'shadow-[0_0_8px_hsl(145_75%_45%/0.8)]',
    orange: 'shadow-[0_0_8px_hsl(25_95%_55%/0.8)]',
    blue: 'shadow-[0_0_6px_hsl(210_90%_55%/0.6)]'
  };

  const speedDurations = {
    slow: direction === 'down' ? '2.5s' : '2s',
    normal: direction === 'down' ? '1.5s' : '1s',
    fast: direction === 'down' ? '1s' : '0.7s'
  };

  return (
    <div
      className={`absolute rounded-full ${colorClasses[color]} ${glowClasses[color]} ${
        direction === 'down' ? 'w-2 h-2 left-1/2 -translate-x-1/2' : 'w-2 h-2 top-1/2 -translate-y-1/2'
      }`}
      style={{
        animation: `${direction === 'down' ? 'energy-particle-down' : 'energy-particle-right'} ${speedDurations[speed]} linear infinite`,
        animationDelay: `${delay}s`
      }}
    />
  );
}

// Vertical energy flow (Solar -> ESS)
function VerticalEnergyFlow({ 
  active, 
  intensity = 1,
  color = 'yellow'
}: { 
  active: boolean;
  intensity?: number;
  color?: 'yellow' | 'green';
}) {
  if (!active) return null;

  const lineColor = color === 'yellow' ? 'bg-solar-yellow' : 'bg-green-energy';
  const speed = intensity > 0.7 ? 'normal' : 'slow';
  
  return (
    <div className="absolute left-1/2 -translate-x-1/2 w-1 h-full" style={{ opacity: Math.max(0.4, intensity) }}>
      {/* Base line */}
      <div className={`absolute inset-0 ${lineColor}/30 rounded-full`} />
      {/* Glow line */}
      <div className={`absolute inset-0 ${lineColor}/50 rounded-full blur-sm`} />
      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <EnergyParticle color={color} delay={0} direction="down" speed={speed} />
        <EnergyParticle color={color} delay={0.5} direction="down" speed={speed} />
        <EnergyParticle color={color} delay={1} direction="down" speed={speed} />
      </div>
    </div>
  );
}

// Horizontal energy flow (ESS/Grid -> CNC)
function HorizontalEnergyFlow({ 
  active, 
  color,
  intensity = 1,
  className = ''
}: { 
  active: boolean;
  color: 'green' | 'orange';
  intensity?: number;
  className?: string;
}) {
  const lineColor = color === 'green' ? 'bg-green-energy' : 'bg-grid-orange';
  const speed = intensity > 0.7 ? 'normal' : intensity > 0.3 ? 'slow' : 'slow';
  
  return (
    <div 
      className={`h-1 rounded-full relative overflow-hidden transition-all duration-500 ${className}`}
      style={{ opacity: active ? Math.max(0.4, intensity) : 0.15 }}
    >
      {/* Base line */}
      <div className={`absolute inset-0 ${active ? lineColor : 'bg-muted'}/30 rounded-full transition-colors duration-500`} />
      {/* Glow line */}
      {active && <div className={`absolute inset-0 ${lineColor}/50 rounded-full blur-sm`} />}
      {/* Particles */}
      {active && (
        <>
          <EnergyParticle color={color} delay={0} direction="right" speed={speed} />
          <EnergyParticle color={color} delay={0.33} direction="right" speed={speed} />
          <EnergyParticle color={color} delay={0.66} direction="right" speed={speed} />
        </>
      )}
    </div>
  );
}

// Data flow indicator (to IPC)
function DataFlowIndicator({ className = '' }: { className?: string }) {
  return (
    <div className={`h-0.5 relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 border-t border-dashed border-data-blue/40" />
      <div className="absolute inset-0 overflow-hidden">
        <EnergyParticle color="blue" delay={0} direction="right" speed="slow" />
        <EnergyParticle color="blue" delay={1} direction="right" speed="slow" />
      </div>
    </div>
  );
}

export function Layer1Field({ solarOutput, batteryLevel, machines, onToggleMachine }: Layer1FieldProps) {
  const isCritical = batteryLevel <= 5;
  const isWarning = batteryLevel < 20 && !isCritical;
  const isLowPower = batteryLevel <= 10;
  
  // Calculate energy flow intensity based on battery and solar
  const solarIntensity = Math.min(1, solarOutput / 95);
  const batteryIntensity = isCritical ? 0 : isWarning ? 0.5 : 1;
  
  const greenMachines = machines.filter(m => m.source === 'storage');
  const gridMachines = machines.filter(m => m.source === 'grid');

  return (
    <div className="layer-section">
      <div className="layer-header">
        <div className="w-6 h-6 rounded bg-green-energy/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-green-energy">L1</span>
        </div>
        <span>實體設備層 Field Layer</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Power Sources with vertical flow */}
        <div className="lg:col-span-3 flex flex-col gap-0 relative">
          {/* Solar PV */}
          <div className="glass-card-dark p-3 border-l-4 border-l-solar-yellow relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Sun className="w-5 h-5 text-solar-yellow animate-energy-glow" />
              <span className="text-sm font-medium">太陽能 PV</span>
            </div>
            <div className="data-value text-solar-yellow">{solarOutput.toFixed(1)} kW</div>
            <div className="data-label">發電輸出</div>
            {/* Flow indicator bar */}
            <div className="mt-2 h-1 bg-solar-yellow/20 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-solar-yellow rounded-full"
                style={{ width: `${Math.min(100, solarOutput)}%` }}
              />
              {solarOutput > 0 && (
                <div className="absolute inset-0 overflow-hidden">
                  <EnergyParticle color="yellow" delay={0} direction="right" />
                </div>
              )}
            </div>
          </div>

          {/* Vertical flow: Solar -> ESS */}
          <div className="h-8 relative flex justify-center">
            <VerticalEnergyFlow active={solarOutput > 0} intensity={solarIntensity} color="yellow" />
          </div>

          {/* ESS Battery */}
          <div className={`glass-card-dark p-3 border-l-4 relative z-10 transition-all duration-300 ${
            isCritical ? 'border-l-critical-red ring-1 ring-critical-red/30' :
            isWarning ? 'border-l-warning-amber' :
            'border-l-green-energy'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <Battery className={`w-5 h-5 transition-colors duration-300 ${
                isCritical ? 'text-critical-red animate-pulse' :
                isWarning ? 'text-warning-amber' :
                'text-green-energy'
              }`} />
              <span className="text-sm font-medium">儲能 ESS</span>
              {isCritical && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-critical-red/20 text-critical-red font-medium animate-pulse">
                  危險
                </span>
              )}
              {isWarning && !isCritical && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning-amber/20 text-warning-amber font-medium">
                  低電量
                </span>
              )}
            </div>
            <div className={`data-value transition-colors duration-300 ${
              isCritical ? 'text-critical-red' :
              isWarning ? 'text-warning-amber' :
              'text-green-energy'
            }`}>{batteryLevel.toFixed(1)}%</div>
            <div className="data-label">電池電量 SOC</div>
            {/* SOC bar */}
            <div className="mt-2 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isCritical ? 'bg-critical-red' :
                  isWarning ? 'bg-warning-amber' :
                  'bg-green-energy'
                }`}
                style={{ width: `${batteryLevel}%` }}
              />
            </div>
          </div>

          {/* Spacer */}
          <div className="h-3" />

          {/* Grid */}
          <div className="glass-card-dark p-3 border-l-4 border-l-grid-orange relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <PlugZap className="w-5 h-5 text-grid-orange" />
              <span className="text-sm font-medium">市電 Grid</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="status-indicator bg-green-energy status-run" />
              <span className="text-sm text-muted-foreground">供電正常</span>
            </div>
          </div>
        </div>

        {/* Flow connectors */}
        <div className="hidden lg:flex lg:col-span-1 flex-col justify-center gap-4 py-4">
          {/* Green energy flow line (ESS -> CNC) */}
          <div className="flex-1 flex flex-col justify-center relative">
            <div className="text-[9px] text-green-energy/70 mb-1 text-center">綠電流</div>
            <HorizontalEnergyFlow 
              active={greenMachines.length > 0 && !isCritical} 
              color="green"
              intensity={batteryIntensity}
            />
            {greenMachines.length > 0 && !isCritical && (
              <div className="text-[8px] text-muted-foreground text-center mt-1">
                {greenMachines.length} 台
              </div>
            )}
          </div>
          
          {/* Separator */}
          <div className="flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary animate-pulse" />
          </div>
          
          {/* Grid energy flow line (Grid -> CNC) */}
          <div className="flex-1 flex flex-col justify-center relative">
            <div className="text-[9px] text-grid-orange/70 mb-1 text-center">市電流</div>
            <HorizontalEnergyFlow 
              active={gridMachines.length > 0 || isCritical}
              color="orange"
              intensity={1}
            />
            {(gridMachines.length > 0 || isCritical) && (
              <div className="text-[8px] text-muted-foreground text-center mt-1">
                {isCritical ? machines.length : gridMachines.length} 台
              </div>
            )}
          </div>
        </div>

        {/* Right: CNC Machines */}
        <div className="lg:col-span-8">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">生產設備區</span>
            <span className="text-xs text-muted-foreground">
              (<span className="text-green-energy">{isCritical ? 0 : greenMachines.length} 綠電</span> / 
              <span className="text-grid-orange ml-1">{isCritical ? machines.length : gridMachines.length} 市電</span>)
            </span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
            {machines.map((machine, idx) => {
              // When critical, force display as grid
              const displaySource = isCritical ? 'grid' : machine.source;
              const isGreen = displaySource === 'storage';
              
              return (
                <div
                  key={machine.id}
                  className={`machine-card relative overflow-hidden transition-all duration-500 ${
                    isGreen ? 'machine-card-green' : 'machine-card-orange'
                  }`}
                  style={{
                    boxShadow: isGreen 
                      ? '0 0 15px hsl(145 75% 45% / 0.15), inset 0 1px 0 hsl(145 75% 45% / 0.1)'
                      : '0 0 15px hsl(25 95% 55% / 0.15), inset 0 1px 0 hsl(25 95% 55% / 0.1)'
                  }}
                >
                  {/* Energy source indicator line at top */}
                  <div 
                    className={`absolute top-0 left-0 right-0 h-0.5 transition-all duration-500 ${
                      isGreen ? 'bg-green-energy' : 'bg-grid-orange'
                    }`}
                  >
                    <div className="absolute inset-0 overflow-hidden">
                      <EnergyParticle 
                        color={isGreen ? 'green' : 'orange'} 
                        delay={idx * 0.15} 
                        direction="right"
                        speed={isGreen && isWarning ? 'slow' : 'normal'}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-2 pt-1">
                    <span className="text-xs font-semibold">CNC #{machine.id}</span>
                    <div className={`status-indicator ${machine.status === 'run' ? 'status-run' : 'status-idle'}`} />
                  </div>

                  <div className="mb-2">
                    <div className={`font-mono text-lg font-bold transition-colors duration-500 ${
                      isGreen ? 'text-green-energy' : 'text-grid-orange'
                    }`}>
                      {machine.load.toFixed(1)}
                    </div>
                    <div className="text-[10px] text-muted-foreground">kW</div>
                  </div>

                  {/* Toggle switch */}
                  <button
                    onClick={() => onToggleMachine(machine.id)}
                    className={`w-full h-6 rounded-full relative transition-all duration-500 ${
                      isGreen ? 'bg-green-energy/30' : 'bg-grid-orange/30'
                    } ${isLowPower && !isGreen ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={isLowPower && machine.source === 'grid'}
                    title={isLowPower && machine.source === 'grid' ? 'SOC 過低，無法切換至綠電' : ''}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 ${
                        isGreen
                          ? 'left-1 bg-green-energy shadow-[0_0_8px_hsl(145_75%_45%/0.6)]'
                          : 'right-1 left-auto bg-grid-orange shadow-[0_0_8px_hsl(25_95%_55%/0.6)]'
                      }`}
                    />
                    <span className={`absolute inset-0 flex items-center justify-center text-[9px] font-medium transition-colors duration-500 ${
                      isGreen ? 'text-green-energy pl-5' : 'text-grid-orange pr-5'
                    }`}>
                      {isGreen ? '綠電' : '市電'}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Data flow to L2 indicator */}
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[10px] text-data-blue/70">資料流 → L2</span>
            <DataFlowIndicator className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}
