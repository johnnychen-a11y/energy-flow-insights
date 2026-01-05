import { Server, Database, Wifi } from 'lucide-react';
import type { Machine } from '@/types/energy';

interface Layer2IPCProps {
  machines: Machine[];
}

export function Layer2IPC({ machines }: Layer2IPCProps) {
  const maxLoad = 10; // For visualization scaling

  return (
    <div className="layer-section bg-card/60">
      <div className="layer-header">
        <div className="w-6 h-6 rounded bg-data-blue/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-data-blue">L2</span>
        </div>
        <span>邊緣運算層 Edge IPC Layer</span>
      </div>

      {/* Data flow indicator from L1 */}
      <div className="flex justify-center mb-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-data-blue/10 border border-dashed border-data-blue/30 relative overflow-hidden">
          <div className="w-2 h-2 rounded-full bg-data-blue shadow-[0_0_6px_hsl(210_90%_55%/0.8)]" 
               style={{ animation: 'energy-particle-down 2s linear infinite' }} />
          <span className="text-[10px] text-data-blue font-medium">資料匯流中</span>
          <div className="w-2 h-2 rounded-full bg-data-blue shadow-[0_0_6px_hsl(210_90%_55%/0.8)]" 
               style={{ animation: 'energy-particle-down 2s linear infinite', animationDelay: '0.7s' }} />
          <div className="w-2 h-2 rounded-full bg-data-blue shadow-[0_0_6px_hsl(210_90%_55%/0.8)]" 
               style={{ animation: 'energy-particle-down 2s linear infinite', animationDelay: '1.4s' }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* IPC Gateway Card */}
        <div className="glass-card-dark p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-data-blue/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-data-blue" />
            </div>
            <div>
              <div className="text-sm font-medium">IPC 閘道器</div>
              <div className="text-xs text-muted-foreground">Edge Gateway</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-green-energy/10 border border-green-energy/30">
              <Wifi className="w-3.5 h-3.5 text-green-energy" />
              <span className="text-xs text-green-energy">Online</span>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded bg-secondary border border-border">
              <Database className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Modbus TCP</span>
            </div>
          </div>
        </div>

        {/* Data Buffer Visualization */}
        <div className="glass-card-dark p-4">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-data-blue" />
            <span className="text-sm font-medium">Data Buffer</span>
            <span className="text-xs text-muted-foreground ml-auto">即時負載</span>
          </div>

          <div className="flex items-end justify-between h-16 gap-1">
            {machines.map((machine, idx) => {
              const height = (machine.load / maxLoad) * 100;
              return (
                <div key={machine.id} className="flex-1 flex flex-col items-center">
                  <div className="w-full h-12 bg-secondary/50 rounded-t relative overflow-hidden">
                    <div
                      className={`absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-t ${
                        machine.source === 'storage' ? 'bg-green-energy/60' : 'bg-grid-orange/60'
                      }`}
                      style={{ height: `${height}%` }}
                    >
                      <div
                        className={`absolute inset-0 animate-data-pulse ${
                          machine.source === 'storage' ? 'bg-green-energy/30' : 'bg-grid-orange/30'
                        }`}
                        style={{ animationDelay: `${idx * 0.1}s` }}
                      />
                    </div>
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1">#{machine.id}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Data flow indicator to L3 */}
      <div className="flex justify-center mt-3">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-data-blue/10 border border-dashed border-data-blue/30">
          <span className="text-[10px] text-data-blue">上傳至雲端</span>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-data-blue animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-data-blue animate-pulse" style={{ animationDelay: '0.2s' }} />
            <div className="w-1.5 h-1.5 rounded-full bg-data-blue animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
