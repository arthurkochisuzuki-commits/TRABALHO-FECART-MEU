import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  Camera,
  Maximize2,
  Minimize2,
  ZoomIn,
  Video,
  UserX,
  Server,
  Filter,
  CheckCircle,
  Layers,
  Sparkles,
  Sliders
} from 'lucide-react';
import { CameraFeed, SecurityAlert, Resident, SystemConfig } from '../types';
import { soundFx } from '../utils/soundUtils';

interface DashboardViewProps {
  cameras: CameraFeed[];
  alerts: SecurityAlert[];
  residents: Resident[];
  config: SystemConfig;
  onViewAlertDetails: (alert: SecurityAlert) => void;
  onViewResidentDetails?: (resident: Resident) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  cameras,
  alerts,
  residents,
  config,
  onViewAlertDetails,
}) => {
  const [selectedCamId, setSelectedCamId] = useState<string>(cameras[0]?.id || 'cam-1');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showYoloBoxes, setShowYoloBoxes] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isWebcamActive, setIsWebcamActive] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'unauthorized' | 'authorized'>('all');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const activeCamera = cameras.find((c) => c.id === selectedCamId) || cameras[0];
  const criticalAlert = alerts.find((a) => a.type === 'unauthorized' && a.status === 'active') || alerts[0];

  // Update real-time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];
      const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
        now.getDate()
      ).padStart(2, '0')}`;
      setCurrentTime(timeStr);
      setCurrentDate(dateStr);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Web camera toggle handler
  const toggleWebcam = async () => {
    if (isWebcamActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsWebcamActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setIsWebcamActive(true);
        soundFx.playCameraShutter();
      } catch (err) {
        alert('Não foi possível acessar a câmera local ou permissão negada.');
      }
    }
  };

  const handleSnapshot = () => {
    soundFx.playCameraShutter();
    // Visual flash
    const el = containerRef.current;
    if (el) {
      el.classList.add('opacity-40');
      setTimeout(() => el.classList.remove('opacity-40'), 150);
    }
  };

  const toggleZoom = () => {
    setZoomLevel((prev) => (prev === 1 ? 1.4 : prev === 1.4 ? 1.8 : 1));
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType === 'unauthorized') return alert.type === 'unauthorized';
    if (filterType === 'authorized') return alert.type === 'authorized';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 space-y-4">
      {/* Mobile Status Bar */}
      <div className="md:hidden flex justify-between items-center bg-[#f2f4f6] px-3.5 py-2 rounded-xl border border-[#c4c6d0]/50 text-xs font-tech text-[#005ac2]">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-[#005ac2] pulse-dot" />
          <span>Supabase: Conectado</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#006876]">
          <div className="w-2 h-2 rounded-full bg-[#006876] pulse-dot" />
          <span>YOLOv8 Ativo</span>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalAlert && (
        <div className="bg-[#ffdad6] border border-[#ba1a1a]/30 p-3.5 md:p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm transition-all animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#ba1a1a] text-white flex items-center justify-center shrink-0 shadow-sm">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-geist text-base md:text-lg font-bold text-[#410002] uppercase tracking-tight">
                PESSOA DESCONHECIDA DETECTADA
              </h2>
              <p className="text-xs font-tech text-[#410002]/80 mt-0.5">
                {criticalAlert.cameraCode} - {criticalAlert.cameraLocation} | {criticalAlert.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={() => onViewAlertDetails(criticalAlert)}
            className="w-full sm:w-auto bg-[#ba1a1a] hover:bg-[#ba1a1a]/90 active:scale-95 text-white px-4 py-2 rounded-lg font-tech text-xs tracking-wider font-semibold transition-all shadow-sm"
          >
            VER DETALHES
          </button>
        </div>
      )}

      {/* Main Grid: Video Feeds & Activity Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Video Feeds (Span 8) */}
        <div className="lg:col-span-8 space-y-3.5">
          {/* Main Primary Camera Viewport */}
          <div
            ref={containerRef}
            className={`relative bg-[#121212] aspect-video rounded-xl overflow-hidden border border-[#424754]/40 shadow-lg group transition-all ${
              isFullscreen ? 'fixed inset-0 z-[100] rounded-none aspect-auto' : ''
            }`}
          >
            {/* Live Video / Background Image */}
            {isWebcamActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
              />
            ) : (
              <div
                className="w-full h-full bg-cover bg-center transition-transform duration-300"
                style={{
                  backgroundImage: `url('${activeCamera.streamImage}')`,
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: 'center center',
                }}
              />
            )}

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 pointer-events-none" />

            {/* Futuristic Scan Line Animation */}
            <div className="scan-line" />

            {/* Top Left HUD: REC status and Camera Code */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 z-10">
              <div className="bg-[#ba1a1a]/95 text-white border border-[#ba1a1a] px-2.5 py-1 text-[11px] font-tech font-bold flex items-center gap-1.5 rounded shadow-sm backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>GRAV AO VIVO</span>
              </div>
              <div className="bg-black/70 text-white border border-white/20 px-2.5 py-1 text-[11px] font-tech rounded shadow-sm backdrop-blur-md">
                {activeCamera.code} - {activeCamera.name.toUpperCase()}
              </div>
            </div>

            {/* Top Right HUD: Realtime Timestamp */}
            <div className="absolute top-3 right-3 text-right z-10">
              <div className="text-[12px] font-tech text-white font-mono tracking-widest drop-shadow-md bg-black/60 px-2 py-0.5 rounded border border-white/10">
                {currentTime} // {currentDate}
              </div>
            </div>

            {/* YOLO AI Detection Bounding Boxes Overlay */}
            {showYoloBoxes && (
              <>
                {activeCamera.hasUnknownDetection ? (
                  <div className="absolute top-[22%] left-[34%] w-[32%] h-[52%] border-2 border-[#ba1a1a] border-dashed flex flex-col justify-between p-1 pointer-events-none transition-all">
                    <div className="flex justify-between">
                      <span className="w-3 h-3 border-t-2 border-l-2 border-[#ba1a1a]" />
                      <span className="w-3 h-3 border-t-2 border-r-2 border-[#ba1a1a]" />
                    </div>
                    <div className="text-center">
                      <span className="bg-[#ba1a1a] text-white text-[10px] font-tech px-2 py-0.5 rounded-sm shadow font-semibold tracking-wider">
                        DESCONHECIDO // {activeCamera.confidenceScore || 98}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="w-3 h-3 border-b-2 border-l-2 border-[#ba1a1a]" />
                      <span className="w-3 h-3 border-b-2 border-r-2 border-[#ba1a1a]" />
                    </div>
                  </div>
                ) : activeCamera.detectedName ? (
                  <div className="absolute top-[25%] left-[40%] w-[26%] h-[48%] border-2 border-[#006876] flex flex-col justify-between p-1 pointer-events-none transition-all">
                    <div className="flex justify-between">
                      <span className="w-3 h-3 border-t-2 border-l-2 border-[#4cd7f6]" />
                      <span className="w-3 h-3 border-t-2 border-r-2 border-[#4cd7f6]" />
                    </div>
                    <div className="text-center">
                      <span className="bg-[#006876] text-white text-[10px] font-tech px-2 py-0.5 rounded-sm shadow font-semibold tracking-wider">
                        {activeCamera.detectedName.toUpperCase()} // 99.4%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="w-3 h-3 border-b-2 border-l-2 border-[#4cd7f6]" />
                      <span className="w-3 h-3 border-b-2 border-r-2 border-[#4cd7f6]" />
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {/* Bottom HUD: Resolution & FPS */}
            <div className="absolute bottom-3 left-3 text-[10px] font-tech text-white/80 flex items-center gap-3 bg-black/60 px-2 py-1 rounded border border-white/10">
              <span>RES: {activeCamera.resolution}</span>
              <span>FPS: {activeCamera.fps}</span>
              <span className="text-emerald-400">● FLUXO SEGURO</span>
            </div>

            {/* Camera Viewport Controls Bar */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/80 p-1.5 rounded-lg backdrop-blur-md border border-white/20 shadow-md">
              <button
                onClick={toggleZoom}
                title={`Zoom (${zoomLevel}x)`}
                className="p-1.5 hover:bg-white/20 rounded text-white transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowYoloBoxes(!showYoloBoxes)}
                title={showYoloBoxes ? 'Ocultar marcadores YOLO' : 'Exibir marcadores YOLO'}
                className={`p-1.5 rounded transition-colors ${
                  showYoloBoxes ? 'bg-[#005ac2] text-white' : 'text-white/60 hover:bg-white/20'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>

              <button
                onClick={toggleWebcam}
                title={isWebcamActive ? 'Desativar câmera local' : 'Testar com sua Webcam'}
                className={`p-1.5 rounded transition-colors ${
                  isWebcamActive ? 'bg-[#ba1a1a] text-white' : 'text-white hover:bg-white/20'
                }`}
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                onClick={handleSnapshot}
                title="Capturar foto"
                className="p-1.5 hover:bg-white/20 rounded text-white transition-colors"
              >
                <Camera className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
                className="p-1.5 hover:bg-white/20 rounded text-white transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Secondary Camera Feeds Carousel */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-tech font-semibold text-[#44474f] uppercase tracking-wider">
                Matriz de Câmeras Adicionais
              </span>
              <span className="text-[11px] font-tech text-[#006876]">
                Clique para alternar o feed principal
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {cameras.map((cam) => {
                const isSelected = cam.id === activeCamera.id;
                return (
                  <button
                    key={cam.id}
                    onClick={() => {
                      setSelectedCamId(cam.id);
                      soundFx.playCameraShutter();
                    }}
                    className={`relative aspect-video rounded-lg overflow-hidden border transition-all text-left group ${
                      isSelected
                        ? 'border-[#005ac2] ring-2 ring-[#005ac2]/40 shadow-md'
                        : 'border-[#c4c6d0]/60 hover:border-[#005ac2]/60'
                    }`}
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-300"
                      style={{ backgroundImage: `url('${cam.streamImage}')` }}
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />

                    {/* Badge */}
                    <div className="absolute top-1.5 left-1.5 bg-black/80 text-white text-[10px] font-tech px-1.5 py-0.5 rounded backdrop-blur-sm border border-white/20">
                      {cam.code}
                    </div>

                    <div className="absolute bottom-1.5 left-1.5 right-1.5 truncate text-[10px] font-tech text-white/90 drop-shadow">
                      {cam.name}
                    </div>

                    {cam.hasUnknownDetection && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#ba1a1a] rounded-full animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Log (Span 4) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-[#c4c6d0]/50 p-4 flex flex-col h-[560px] shadow-sm">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#e1e2ec] pb-3 mb-3">
            <div>
              <h3 className="font-geist text-base font-bold text-[#1a1c1e] flex items-center gap-2">
                Registro de Atividades
              </h3>
              <p className="text-[11px] font-tech text-[#44474f]">Eventos em tempo real</p>
            </div>

            {/* Quick filter */}
            <div className="flex gap-1 bg-[#f3f4f6] p-0.5 rounded-lg border border-[#e5e7eb]">
              <button
                onClick={() => setFilterType('all')}
                className={`px-2 py-0.5 text-[10px] font-tech rounded transition-colors ${
                  filterType === 'all'
                    ? 'bg-[#005ac2] text-white font-bold'
                    : 'text-[#44474f] hover:text-[#1a1c1e]'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('unauthorized')}
                className={`px-2 py-0.5 text-[10px] font-tech rounded transition-colors ${
                  filterType === 'unauthorized'
                    ? 'bg-[#ba1a1a] text-white font-bold'
                    : 'text-[#44474f] hover:text-[#ba1a1a]'
                }`}
              >
                Não Aut.
              </button>
              <button
                onClick={() => setFilterType('authorized')}
                className={`px-2 py-0.5 text-[10px] font-tech rounded transition-colors ${
                  filterType === 'authorized'
                    ? 'bg-[#006876] text-white font-bold'
                    : 'text-[#44474f] hover:text-[#006876]'
                }`}
              >
                Aut.
              </button>
            </div>
          </div>

          {/* Activity Item List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
            {filteredAlerts.length === 0 ? (
              <div className="py-12 text-center text-xs font-tech text-[#44474f]">
                Nenhum evento registrado nesta categoria.
              </div>
            ) : (
              filteredAlerts.map((alert) => {
                const isUnauthorized = alert.type === 'unauthorized';
                const isAuthorized = alert.type === 'authorized';
                const isOffline = alert.type === 'camera_offline';

                return (
                  <div
                    key={alert.id}
                    onClick={() => onViewAlertDetails(alert)}
                    className={`bg-[#f7f9fb] p-3 rounded-lg border-l-4 transition-all cursor-pointer hover:bg-[#ffffff] hover:shadow-md ${
                      isUnauthorized
                        ? 'border-l-[#ba1a1a] border-y border-r border-[#c4c6d0]/40'
                        : isAuthorized
                        ? 'border-l-[#005ac2] border-y border-r border-[#c4c6d0]/40'
                        : 'border-l-[#74777f] border-y border-r border-[#c4c6d0]/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Avatar / Icon */}
                      {isUnauthorized ? (
                        <div className="w-8 h-8 rounded-full bg-[#ffdad6] text-[#ba1a1a] flex items-center justify-center shrink-0">
                          <UserX className="w-4 h-4" />
                        </div>
                      ) : isAuthorized && alert.residentAvatar ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-[#005ac2]/30 shrink-0">
                          <img
                            src={alert.residentAvatar}
                            alt={alert.residentName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#e2e2e5] text-[#44474f] flex items-center justify-center shrink-0">
                          <Server className="w-4 h-4" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span
                            className={`font-tech text-xs font-bold truncate ${
                              isUnauthorized
                                ? 'text-[#ba1a1a]'
                                : isAuthorized
                                ? 'text-[#005ac2]'
                                : 'text-[#1a1c1e]'
                            }`}
                          >
                            {alert.residentName || alert.title}
                          </span>
                          <span className="text-[10px] font-tech text-[#44474f] shrink-0 ml-1">
                            {alert.timestamp}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1">
                          {isAuthorized && (
                            <span className="bg-[#d8e2ff] text-[#001a42] text-[9px] font-tech px-1.5 py-0.2 rounded border border-[#005ac2]/20">
                              {alert.residentRole || 'Morador'}
                            </span>
                          )}
                          <p className="text-xs text-[#44474f] truncate">
                            {alert.description || alert.cameraLocation}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Simulation Trigger */}
          <div className="pt-3 border-t border-[#e1e2ec] mt-2">
            <div className="flex items-center justify-between text-[11px] font-tech text-[#44474f]">
              <span>Monitoramento Ativo</span>
              <span className="text-[#006876] font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Supabase Local
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
