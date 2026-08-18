import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  VideoOff,
  Radio,
  FileSpreadsheet,
  FileJson,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { SecurityAlert } from '../types';
import { exportAlertsToCsv, exportToJson } from '../utils/exportUtils';
import { soundFx } from '../utils/soundUtils';

interface AlertsViewProps {
  alerts: SecurityAlert[];
  onEscalateAlert: (alertId: string) => void;
  onResolveAlert: (alertId: string) => void;
  onViewDetails: (alert: SecurityAlert) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onEscalateAlert,
  onResolveAlert,
  onViewDetails,
}) => {
  const [filter, setFilter] = useState<'all' | 'authorized' | 'unauthorized'>('all');

  const filteredAlerts = alerts.filter((alert) => {
    if (filter === 'authorized') return alert.type === 'authorized';
    if (filter === 'unauthorized') return alert.type === 'unauthorized';
    return true;
  });

  const handleEscalate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundFx.playAlertAlarm();
    onEscalateAlert(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#e1e2ec] pb-5">
        <div>
          <h1 className="font-geist text-2xl md:text-3xl font-bold text-[#1a1c1e] tracking-tight">
            Histórico de Alertas
          </h1>
          <p className="text-sm font-inter text-[#44474f] mt-1">
            Registros de segurança do sistema e tentativas de acesso.
          </p>
        </div>

        {/* Filter Pills and Export buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5 glass-panel p-1.5 rounded-xl border border-[#c4c6d0]/50 shadow-sm">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-medium transition-all ${
                filter === 'all'
                  ? 'bg-[#d8e2ff] text-[#001a42] font-semibold shadow-xs'
                  : 'bg-white text-[#44474f] hover:text-[#1a1c1e]'
              }`}
            >
              Todos os Eventos
            </button>
            <button
              onClick={() => setFilter('authorized')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-medium transition-all flex items-center gap-1.5 ${
                filter === 'authorized'
                  ? 'bg-[#a3eeff] text-[#001f26] font-semibold shadow-xs'
                  : 'bg-white text-[#44474f] hover:text-[#1a1c1e]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#006876]" />
              Autorizados
            </button>
            <button
              onClick={() => setFilter('unauthorized')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-tech font-medium transition-all flex items-center gap-1.5 ${
                filter === 'unauthorized'
                  ? 'bg-[#ffdad6] text-[#410002] font-semibold shadow-xs'
                  : 'bg-white text-[#44474f] hover:text-[#1a1c1e]'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a]" />
              Não Autorizados
            </button>
          </div>

          {/* Export Quick Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => exportAlertsToCsv(alerts)}
              title="Exportar alertas para CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c4c6d0]/60 bg-white hover:bg-gray-50 text-[#44474f] text-xs font-tech transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#006876]" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => exportToJson(alerts, 'safeguard_alertas')}
              title="Exportar alertas para JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c4c6d0]/60 bg-white hover:bg-gray-50 text-[#44474f] text-xs font-tech transition-colors"
            >
              <FileJson className="w-3.5 h-3.5 text-[#005ac2]" />
              <span className="hidden sm:inline">JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="relative pl-6 md:pl-0">
        {/* Central Continuous Line on desktop / left line on mobile */}
        <div className="hidden md:block absolute left-[159px] top-4 bottom-4 w-0.5 bg-[#e1e2ec]" />
        <div className="md:hidden absolute left-2 top-4 bottom-4 w-0.5 bg-[#e1e2ec]" />

        {/* List of Entries */}
        <div className="space-y-6">
          {filteredAlerts.map((alert) => {
            const isUnauthorized = alert.type === 'unauthorized';
            const isAuthorized = alert.type === 'authorized';
            const isOffline = alert.type === 'camera_offline';

            return (
              <div
                key={alert.id}
                onClick={() => onViewDetails(alert)}
                className="relative flex flex-col md:flex-row items-start group cursor-pointer"
              >
                {/* Desktop Left: Timestamp */}
                <div className="hidden md:block w-36 shrink-0 pt-2 text-right pr-6">
                  <div
                    className={`font-tech text-xs font-bold ${
                      isUnauthorized
                        ? 'text-[#ba1a1a]'
                        : isAuthorized
                        ? 'text-[#006876]'
                        : 'text-[#74777f]'
                    }`}
                  >
                    {alert.timestamp}
                  </div>
                  <div className="font-tech text-[11px] text-[#44474f]/80 mt-0.5">
                    {alert.date}
                  </div>
                </div>

                {/* Mobile Dot and Timestamp */}
                <div className="md:hidden flex items-center gap-2 mb-2">
                  <div
                    className={`w-3.5 h-3.5 rounded-full border-2 border-white shrink-0 -ml-[23px] z-10 ${
                      isUnauthorized
                        ? 'bg-[#ba1a1a]'
                        : isAuthorized
                        ? 'bg-[#006876]'
                        : 'bg-[#74777f]'
                    }`}
                  />
                  <div
                    className={`font-tech text-xs font-bold ${
                      isUnauthorized
                        ? 'text-[#ba1a1a]'
                        : isAuthorized
                        ? 'text-[#006876]'
                        : 'text-[#44474f]'
                    }`}
                  >
                    {alert.timestamp} | {alert.date}
                  </div>
                </div>

                {/* Desktop Central Timeline Dot */}
                <div
                  className={`hidden md:block absolute left-[153px] top-3 w-3.5 h-3.5 rounded-full border-2 border-white z-10 ${
                    isUnauthorized
                      ? 'bg-[#ba1a1a]'
                      : isAuthorized
                      ? 'bg-[#006876]'
                      : 'bg-[#74777f]'
                  }`}
                />

                {/* Main Card Content */}
                <div
                  className={`w-full md:ml-8 glass-panel rounded-xl border p-4 md:p-5 relative overflow-hidden transition-all duration-200 hover:shadow-md ${
                    isUnauthorized
                      ? 'border-[#ba1a1a]/30 neon-scan-unauthorized hover:bg-[#ffdad6]/20'
                      : isAuthorized
                      ? 'border-[#006876]/30 neon-scan-authorized hover:bg-[#a3eeff]/20'
                      : 'border-[#c4c6d0]/60 hover:bg-white'
                  }`}
                >
                  {/* Left Accent Strip */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      isUnauthorized
                        ? 'bg-[#ba1a1a]'
                        : isAuthorized
                        ? 'bg-[#006876]'
                        : 'bg-[#74777f]'
                    }`}
                  />

                  {/* Card Body */}
                  {isUnauthorized ? (
                    /* Unauthorized Access Layout with Snapshot */
                    <div className="flex flex-col lg:flex-row justify-between gap-5">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
                          <h2 className="font-geist text-base md:text-lg font-bold text-[#1a1c1e]">
                            {alert.title}
                          </h2>
                          {alert.status === 'escalated' && (
                            <span className="bg-[#ba1a1a] text-white text-[10px] font-tech px-2 py-0.5 rounded font-bold uppercase">
                              Escalado
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-4 pt-1">
                          <div>
                            <span className="text-[10px] font-tech text-[#44474f] block uppercase">
                              ID DA CÂMERA
                            </span>
                            <span className="text-xs font-tech text-[#006876] font-semibold">
                              {alert.cameraCode}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] font-tech text-[#44474f] block uppercase">
                              LOCALIZAÇÃO
                            </span>
                            <span className="text-xs font-inter text-[#1a1c1e] font-medium">
                              {alert.cameraLocation}
                            </span>
                          </div>

                          <div className="col-span-2 sm:col-span-1">
                            <span className="text-[10px] font-tech text-[#44474f] block uppercase">
                              CONFIANÇA DA CORRESPONDÊNCIA
                            </span>
                            <span className="text-xs font-tech text-[#ba1a1a] font-bold">
                              {alert.confidenceLabel || 'DESCONHECIDO (0%)'}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={(e) => handleEscalate(alert.id, e)}
                            className="text-xs font-tech font-bold text-[#ba1a1a] border border-[#ba1a1a]/40 bg-[#ba1a1a]/5 hover:bg-[#ba1a1a]/15 px-3 py-1.5 rounded-md transition-colors"
                          >
                            ESCALAR ALERTA
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onResolveAlert(alert.id);
                            }}
                            className="text-xs font-tech text-[#44474f] hover:text-[#1a1c1e] px-3 py-1.5 rounded-md transition-colors border border-[#c4c6d0]/50"
                          >
                            Marcar como Resolvido
                          </button>
                        </div>
                      </div>

                      {/* Snapshot Viewport */}
                      {alert.snapshotUrl && (
                        <div className="shrink-0 relative w-full lg:w-56 aspect-video sm:aspect-4/3 rounded-lg overflow-hidden border border-[#c4c6d0]/50 bg-black">
                          <img
                            src={alert.snapshotUrl}
                            alt="CCTV Snapshot"
                            className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                          />
                          {/* Live Recording HUD badge */}
                          <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/80 backdrop-blur-sm rounded text-[10px] font-tech text-white flex items-center gap-1.5 shadow-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] animate-pulse" />
                            <span>GRAVANDO</span>
                          </div>

                          {/* Futuristic HUD brackets */}
                          <div className="absolute inset-4 border-2 border-transparent border-t-[#ff5722] border-l-[#ff5722] w-6 h-6 opacity-80" />
                          <div className="absolute inset-4 border-2 border-transparent border-t-[#ff5722] border-r-[#ff5722] w-6 h-6 right-4 left-auto opacity-80" />
                          <div className="absolute inset-4 border-2 border-transparent border-b-[#ff5722] border-l-[#ff5722] w-6 h-6 bottom-4 top-auto opacity-80" />
                          <div className="absolute inset-4 border-2 border-transparent border-b-[#ff5722] border-r-[#ff5722] w-6 h-6 bottom-4 top-auto right-4 left-auto opacity-80" />
                        </div>
                      )}
                    </div>
                  ) : isAuthorized ? (
                    /* Authorized Entry Layout */
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-[#006876]" />
                          <h2 className="font-geist text-base md:text-lg font-bold text-[#1a1c1e]">
                            {alert.title}
                          </h2>
                        </div>
                        <div className="text-xs font-tech text-[#44474f]">
                          {alert.cameraCode} • {alert.cameraLocation}
                        </div>

                        <div className="flex items-center gap-2.5 pt-2">
                          {alert.residentAvatar && (
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-[#006876]/40 shrink-0">
                              <img
                                src={alert.residentAvatar}
                                alt={alert.residentName}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <span className="text-sm font-semibold text-[#1a1c1e]">
                            {alert.residentName || 'Sarah Jenkins'}
                          </span>
                        </div>
                      </div>

                      <div className="text-xs font-tech text-[#006876] bg-[#006876]/10 px-3 py-1.5 rounded-md border border-[#006876]/20 font-bold whitespace-nowrap">
                        {alert.confidenceLabel || `CORRESPONDÊNCIA: ${alert.confidence || 98.4}%`}
                      </div>
                    </div>
                  ) : (
                    /* System / Camera Offline Layout */
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <VideoOff className="w-5 h-5 text-[#74777f]" />
                        <h2 className="font-geist text-base md:text-lg font-bold text-[#1a1c1e]">
                          {alert.title}
                        </h2>
                      </div>
                      <div className="text-xs font-tech text-[#44474f]">
                        {alert.cameraCode} • {alert.cameraLocation}
                      </div>
                      <p className="text-xs font-inter text-[#44474f] pt-1">
                        {alert.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
