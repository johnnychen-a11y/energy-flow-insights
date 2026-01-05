import { useEnergySimulation } from '@/hooks/useEnergySimulation';
import { Header } from './Header';
import { SiteTabs } from './SiteTabs';
import { Layer1Field } from './Layer1Field';
import { Layer2IPC } from './Layer2IPC';
import { Layer3Cloud } from './Layer3Cloud';

export function EnergyDashboard() {
  const {
    state,
    activeSiteState,
    totalLoad,
    greenLoad,
    setActiveSite,
    toggleMachineSource,
    switchAllToSource,
    clearSiteAlerts,
  } = useEnergySimulation();

  return (
    <div className="min-h-screen bg-background p-3 md:p-4 lg:p-6">
      <div className="max-w-[1920px] mx-auto">
        <Header
          activeSite={state.activeSite}
          solarOutput={activeSiteState.solarOutput}
          batteryLevel={activeSiteState.batteryLevel}
          batteryTemp={activeSiteState.batteryTemp}
          totalLoad={totalLoad}
          greenLoad={greenLoad}
        />

        <SiteTabs
          activeSite={state.activeSite}
          sites={state.sites}
          onSiteChange={setActiveSite}
        />

        <div className="space-y-4">
          <Layer1Field
            solarOutput={activeSiteState.solarOutput}
            batteryLevel={activeSiteState.batteryLevel}
            machines={activeSiteState.machines}
            onToggleMachine={toggleMachineSource}
          />

          <Layer2IPC machines={activeSiteState.machines} />

          <Layer3Cloud
            siteState={activeSiteState}
            activeSite={state.activeSite}
            allSites={state.sites}
            totalLoad={totalLoad}
            greenLoad={greenLoad}
            commandStatus={state.commandStatus}
            onToggleMachine={toggleMachineSource}
            onSwitchAll={switchAllToSource}
            onClearAlerts={clearSiteAlerts}
          />
        </div>

        {/* Footer */}
        <footer className="mt-6 text-center text-xs text-muted-foreground">
          <p>智慧工廠能源流向與數據監控系統 · Energy & Data Flow Dashboard</p>
          <p className="mt-1">Prototype Demo · Real-time Simulation</p>
        </footer>
      </div>
    </div>
  );
}
