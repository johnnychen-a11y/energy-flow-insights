import { useState } from 'react';
import { Cloud, Cpu, Settings, Zap, PlugZap, Send, CheckCircle, Loader2, Sparkles } from 'lucide-react';
import type { Machine, CommandStatus, SiteState, SiteId } from '@/types/energy';
import { AlertCenter } from './AlertCenter';

interface Layer3CloudProps {
  siteState: SiteState;
  activeSite: SiteId;
  allSites: Record<SiteId, SiteState>;
  totalLoad: number;
  greenLoad: number;
  commandStatus: CommandStatus;
  onToggleMachine: (id: number) => void;
  onSwitchAll: (source: 'storage' | 'grid') => void;
  onClearAlerts: () => void;
}

export function Layer3Cloud({
  siteState,
  activeSite,
  allSites,
  totalLoad,
  greenLoad,
  commandStatus,
  onToggleMachine,
  onSwitchAll,
  onClearAlerts,
}: Layer3CloudProps) {
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const isCritical = siteState.batteryLevel <= 5;

  const generateAiSuggestion = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const suggestions: string[] = [];
      const soc = siteState.batteryLevel;
      const solar = siteState.solarOutput;
      const greenMachines = siteState.machines.filter(m => m.source === 'storage').length;
      const gridMachines = siteState.machines.filter(m => m.source === 'grid').length;

      if (soc < 10) {
        suggestions.push(`⚠️ 電池電量極低 (${soc.toFixed(0)}%)，建議立即切換所有設備至市電，避免生產中斷。`);
        suggestions.push(`待太陽能發電穩定後（目前 ${solar.toFixed(0)}kW），再逐步切回綠電。`);
      } else if (soc < 30) {
        suggestions.push(`電池電量偏低 (${soc.toFixed(0)}%)，建議減少 ${Math.ceil(greenMachines / 2)} 台設備的綠電供應。`);
        if (solar > 80) {
          suggestions.push(`太陽能輸出良好 (${solar.toFixed(0)}kW)，預計 30 分鐘內可恢復至安全水位。`);
        }
      } else if (soc > 70 && solar > 85) {
        suggestions.push(`系統運作良好！電池充足 (${soc.toFixed(0)}%)，太陽能輸出強勁 (${solar.toFixed(0)}kW)。`);
        if (gridMachines > 0) {
          suggestions.push(`可將 ${gridMachines} 台市電設備切換至綠電，提升再生能源使用率。`);
        }
      } else {
        suggestions.push(`目前 ${greenMachines} 台使用綠電、${gridMachines} 台使用市電，負載配置合理。`);
        suggestions.push(`持續監控電池水位，維持 SOC > 20% 以確保供電穩定。`);
      }

      if (totalLoad > 40) {
        suggestions.push(`⚡ 總負載較高 (${totalLoad.toFixed(1)}kW)，注意避免瞬間過載。`);
      }

      setAiSuggestion(suggestions.slice(0, 3).join('\n\n'));
      setIsGenerating(false);
    }, 1000);
  };

  return (
    <div className="layer-section">
      <div className="layer-header">
        <div className="w-6 h-6 rounded bg-primary/20 flex items-center justify-center">
          <span className="text-[10px] font-bold text-primary">L3</span>
        </div>
        <span>雲端戰情平台 Cloud Platform</span>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Control Panel */}
        <div className="glass-card-dark p-4">
          <div className="flex items-center gap-2 mb-4">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">遠端監控與控制</span>
          </div>

          {/* Total Load Display */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-secondary/50">
            <div>
              <div className="text-xs text-muted-foreground">總負載</div>
              <div className="data-value">{totalLoad.toFixed(1)} kW</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">綠電負載</div>
              <div className="data-value text-green-energy">{greenLoad.toFixed(1)} kW</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">綠電佔比</div>
              <div className="data-value text-primary">{totalLoad > 0 ? ((greenLoad / totalLoad) * 100).toFixed(0) : 0}%</div>
            </div>
          </div>

          {/* Individual Machine Controls */}
          <div className="mb-4">
            <div className="text-xs text-muted-foreground mb-2">機台獨立切換</div>
            <div className="flex flex-wrap gap-1.5">
              {siteState.machines.map(machine => (
                <button
                  key={machine.id}
                  onClick={() => onToggleMachine(machine.id)}
                  className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                    machine.source === 'storage'
                      ? 'bg-green-energy/20 text-green-energy border border-green-energy/40 hover:bg-green-energy/30'
                      : 'bg-grid-orange/20 text-grid-orange border border-grid-orange/40 hover:bg-grid-orange/30'
                  }`}
                  disabled={machine.source === 'grid' && isCritical}
                >
                  {machine.id}
                </button>
              ))}
            </div>
          </div>

          {/* Fleet Control */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">全廠一鍵調度</div>
            <div className="flex gap-2">
              <button
                onClick={() => onSwitchAll('storage')}
                disabled={commandStatus !== 'idle' || isCritical}
                className="flex-1 control-button control-button-green flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-3.5 h-3.5" />
                全切綠電
              </button>
              <button
                onClick={() => onSwitchAll('grid')}
                disabled={commandStatus !== 'idle'}
                className="flex-1 control-button control-button-orange flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <PlugZap className="w-3.5 h-3.5" />
                全切市電
              </button>
            </div>

            {/* Command Status */}
            {commandStatus !== 'idle' && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                {commandStatus === 'sending' && (
                  <>
                    <Send className="w-3.5 h-3.5 text-primary animate-pulse" />
                    <span className="text-muted-foreground">發送指令中...</span>
                  </>
                )}
                {commandStatus === 'processing' && (
                  <>
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    <span className="text-muted-foreground">處理中...</span>
                  </>
                )}
                {commandStatus === 'success' && (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-green-energy" />
                    <span className="text-green-energy">指令執行成功</span>
                  </>
                )}
              </div>
            )}

            {isCritical && (
              <div className="mt-2 text-xs text-critical-red">
                ⚠️ SOC 過低，已啟動保護機制，禁止切換至綠電
              </div>
            )}
          </div>
        </div>

        {/* AI Energy Advisor */}
        <div className="glass-card-dark p-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">AI 能源顧問</span>
          </div>

          <div className="min-h-[120px] mb-4">
            {aiSuggestion ? (
              <div className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                {aiSuggestion}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                AI 隨時準備為您優化電源分配，點擊下方按鈕產生建議。
              </div>
            )}
          </div>

          <button
            onClick={generateAiSuggestion}
            disabled={isGenerating}
            className="w-full control-button control-button-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                分析中...
              </>
            ) : (
              <>
                <Cpu className="w-3.5 h-3.5" />
                產生優化策略
              </>
            )}
          </button>
        </div>

        {/* Alert Center */}
        <AlertCenter
          alerts={siteState.alerts}
          activeSite={activeSite}
          allSites={allSites}
          onClearAlerts={onClearAlerts}
        />
      </div>
    </div>
  );
}
