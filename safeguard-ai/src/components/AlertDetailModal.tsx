import React from 'react';
import { X, AlertTriangle, ShieldCheck, VideoOff, MapPin, Camera, Clock, CheckCircle, Share2, ShieldAlert } from 'lucide-react';
import { SecurityAlert } from '../types';

interface AlertDetailModalProps {
  alert: SecurityAlert | null;
  onClose: () => void;
  onEscalate: (alertId: string) => void;
  onResolve: (alertId: string) => void;
}

export const AlertDetailModal: React.FC<AlertDetailModalProps> = ({
  alert,
  onClose,
  onEscalate,
  onResolve,
}) => {
  if (!alert) return null;

  const isUnauthorized = alert.type === 'unauthorized';
  const isAuthorized = alert.type === 'authorized';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel relative w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-[#c4c6d0]/60 max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#44474f] hover:text-[#1a1c1e] p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center ${
              isUnauthorized
                ? 'bg-[#ffdad6] text-[#ba1a1a]'
                : isAuthorized
                ? 'bg-[#d8e2ff] text-[#005ac2]'
                : 'bg-[#e2e2e5] text-[#44474f]'
            }`}
          >
            {isUnauthorized ? (
              <AlertTriangle className="w-6 h-6" />
            ) : isAuthorized ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <VideoOff className="w-6 h-6" />
            )}
          </div>

          <div>
            <h2 className="font-geist text-xl font-bold text-[#1a1c1e]">
              {alert.title}
            </h2>
            <div className="flex items-center gap-2 text-xs font-tech text-[#44474f] mt-0.5">
              <span>{alert.timestamp}</span>
              <span>•</span>
              <span>{alert.date}</span>
              <span>•</span>
              <span className="text-[#006876] font-semibold">{alert.cameraCode}</span>
            </div>
          </div>
        </div>

        {/* CCTV Snapshot Viewport */}
        {alert.snapshotUrl && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-[#c4c6d0]/60 mb-5 group">
            <img
              src={alert.snapshotUrl}
              alt="Snapshot"
              className="w-full h-full object-cover"
            />
            {/* Live REC tag */}
            <div className="absolute top-3 left-3 px-2.5 py-1 bg-black/80 backdrop-blur-md rounded text-xs font-tech text-white flex items-center gap-1.5 border border-white/20">
              <span className="w-2 h-2 rounded-full bg-[#ba1a1a] animate-pulse" />
              <span>FRAME CONGELADO / CAPTURA YOLO</span>
            </div>

            {/* Corner brackets */}
            <div className="absolute inset-6 border-2 border-transparent border-t-[#ff5722] border-l-[#ff5722] w-8 h-8 opacity-90" />
            <div className="absolute inset-6 border-2 border-transparent border-t-[#ff5722] border-r-[#ff5722] w-8 h-8 right-6 left-auto opacity-90" />
            <div className="absolute inset-6 border-2 border-transparent border-b-[#ff5722] border-l-[#ff5722] w-8 h-8 bottom-6 top-auto opacity-90" />
            <div className="absolute inset-6 border-2 border-transparent border-b-[#ff5722] border-r-[#ff5722] w-8 h-8 bottom-6 top-auto right-6 left-auto opacity-90" />
          </div>
        )}

        {/* Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-[#f7f9fb] p-4 rounded-xl border border-[#c4c6d0]/40 mb-5 text-xs font-tech">
          <div>
            <span className="text-[#44474f] block uppercase text-[10px]">CÂMERA</span>
            <span className="font-bold text-[#006876]">{alert.cameraCode}</span>
          </div>

          <div>
            <span className="text-[#44474f] block uppercase text-[10px]">LOCALIZAÇÃO</span>
            <span className="font-semibold text-[#1a1c1e]">{alert.cameraLocation}</span>
          </div>

          <div>
            <span className="text-[#44474f] block uppercase text-[10px]">CORRESPONDÊNCIA</span>
            <span className={`font-bold ${isUnauthorized ? 'text-[#ba1a1a]' : 'text-[#006876]'}`}>
              {alert.confidenceLabel || `${alert.confidence || 0}%`}
            </span>
          </div>

          <div>
            <span className="text-[#44474f] block uppercase text-[10px]">STATUS</span>
            <span className="uppercase font-bold text-[#005ac2]">{alert.status}</span>
          </div>

          <div className="col-span-2">
            <span className="text-[#44474f] block uppercase text-[10px]">BANCO DE DADOS</span>
            <span className="text-[#1a1c1e]">Supabase Local Node (Synced)</span>
          </div>
        </div>

        {/* Narrative & Details */}
        <div className="space-y-2 mb-6">
          <h3 className="font-geist text-sm font-bold text-[#1a1c1e]">
            Análise e Diagnóstico do Sistema
          </h3>
          <p className="text-xs font-inter text-[#44474f] leading-relaxed">
            {alert.description || 'Detecção de presença não autorizada registrada pelo sensor óptico.'}
          </p>
          {alert.details && (
            <p className="text-xs font-tech text-[#006876] bg-[#006876]/5 p-3 rounded-lg border border-[#006876]/20">
              {alert.details}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-4 border-t border-[#e1e2ec]">
          {isUnauthorized && alert.status !== 'escalated' && (
            <button
              onClick={() => {
                onEscalate(alert.id);
                onClose();
              }}
              className="px-4 py-2 rounded-lg bg-[#ba1a1a] hover:bg-[#ba1a1a]/90 text-white font-tech text-xs font-bold tracking-wider transition-colors"
            >
              ESCALAR ALERTA À SEGURANÇA
            </button>
          )}

          <button
            onClick={() => {
              onResolve(alert.id);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-[#005ac2] hover:bg-[#005ac2]/90 text-white font-tech text-xs font-bold tracking-wider transition-colors"
          >
            RESOLVER OCORRÊNCIA
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#c4c6d0] text-[#44474f] hover:bg-gray-50 font-tech text-xs font-medium transition-colors"
          >
            FECHAR
          </button>
        </div>
      </div>
    </div>
  );
};
