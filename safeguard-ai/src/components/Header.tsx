import React from 'react';
import { Shield, CloudCheck, BellRing, Volume2, VolumeX, Sparkles, RefreshCw } from 'lucide-react';
import { SystemConfig } from '../types';

interface HeaderProps {
  config: SystemConfig;
  onUpdateConfig: (newConfig: Partial<SystemConfig>) => void;
  activeAlertsCount: number;
  onSimulateEvent: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onUpdateConfig,
  activeAlertsCount,
  onSimulateEvent,
}) => {
  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-[#e1e2ec]/60 shadow-sm sticky top-0 z-50 px-4 md:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-[#d8e2ff] flex items-center justify-center text-[#005ac2] shadow-sm">
            <Shield className="w-5 h-5 fill-[#005ac2]/20 text-[#005ac2]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-geist text-xl font-bold tracking-tight text-[#1a1c1e]">
                SafeGuard <span className="text-[#005ac2]">AI</span>
              </span>
              <span className="text-[10px] font-tech uppercase tracking-wider bg-[#006876]/10 text-[#006876] px-1.5 py-0.5 rounded font-medium border border-[#006876]/20">
                v2.4
              </span>
            </div>
          </div>
        </div>

        {/* Center Indicators - Desktop */}
        <div className="hidden md:flex items-center gap-5 text-xs font-tech text-[#44474f]">
          <div className="flex items-center gap-2 bg-[#f3f4f6] px-2.5 py-1 rounded-md border border-[#e5e7eb]">
            <div
              className={`w-2 h-2 rounded-full ${
                config.supabaseStatus === 'connected'
                  ? 'bg-[#005ac2] pulse-dot'
                  : 'bg-amber-500'
              }`}
            />
            <span>Supabase: <strong className="text-[#1a1c1e]">Conectado</strong></span>
          </div>

          <div className="flex items-center gap-2 bg-[#f3f4f6] px-2.5 py-1 rounded-md border border-[#e5e7eb]">
            <div
              className={`w-2 h-2 rounded-full ${
                config.yoloEngineActive ? 'bg-[#006876] pulse-dot' : 'bg-gray-400'
              }`}
            />
            <span>Motor YOLO: <strong className="text-[#1a1c1e]">Ativo ({Math.round(config.yoloConfidence * 100)}%)</strong></span>
          </div>
        </div>

        {/* Quick Action Tools */}
        <div className="flex items-center gap-2">
          {/* Simulate Event for Live Testing */}
          <button
            onClick={onSimulateEvent}
            title="Simular detecção em tempo real"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#d8e2ff]/80 hover:bg-[#d8e2ff] text-[#001a42] font-tech text-xs transition-colors border border-[#005ac2]/20"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#005ac2]" />
            <span className="hidden sm:inline">Simular Detecção</span>
          </button>

          {/* Sound Alarm Mute / Unmute */}
          <button
            onClick={() =>
              onUpdateConfig({ soundAlarmsEnabled: !config.soundAlarmsEnabled })
            }
            title={config.soundAlarmsEnabled ? 'Alarme sonoro ativado' : 'Alarme sonoro silenciado'}
            className={`p-1.5 rounded-md text-xs transition-colors border ${
              config.soundAlarmsEnabled
                ? 'bg-[#f7f9fb] text-[#006876] border-[#e1e2ec] hover:bg-[#eeeeef]'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {config.soundAlarmsEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Cloud Sync Status Icon */}
          <div
            title="Sincronizado com nuvem"
            className="text-[#006876] p-1.5 rounded-md hover:bg-[#006876]/10 transition-colors cursor-pointer"
          >
            <CloudCheck className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};
