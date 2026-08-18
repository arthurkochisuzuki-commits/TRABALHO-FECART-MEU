import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileJson,
  Package,
  Terminal,
  Copy,
  Check,
  Server,
  Layers,
  Sparkles,
  Shield,
  FileCode
} from 'lucide-react';
import { Resident, SecurityAlert, SystemConfig, CameraFeed } from '../types';
import {
  exportFullBackup,
  exportResidentsToCsv,
  exportAlertsToCsv,
  exportToJson,
} from '../utils/exportUtils';

interface ExportViewProps {
  residents: Resident[];
  alerts: SecurityAlert[];
  cameras: CameraFeed[];
  config: SystemConfig;
}

export const ExportView: React.FC<ExportViewProps> = ({
  residents,
  alerts,
  cameras,
  config,
}) => {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2000);
  };

  const standaloneDockerSnippet = `FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]`;

  const localRunSnippet = `# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento
npm run dev

# 3. Gerar build de produção para exportação
npm run build`;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#e1e2ec] pb-5">
        <h1 className="font-geist text-2xl md:text-3xl font-bold text-[#1a1c1e] tracking-tight">
          Central de Exportação & Pacotes
        </h1>
        <p className="text-sm font-inter text-[#44474f] mt-1">
          Exporte bancos de dados, relatórios de auditoria e guias de build para distribuição autônoma.
        </p>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-[#c4c6d0]/50 p-4 shadow-xs">
          <span className="text-[11px] font-tech text-[#44474f] uppercase block">
            Moradores Cadastrados
          </span>
          <span className="text-2xl font-geist font-bold text-[#005ac2] mt-1 block">
            {residents.length}
          </span>
          <span className="text-[10px] font-tech text-emerald-600 font-semibold">
            ● 100% Sincronizados
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#c4c6d0]/50 p-4 shadow-xs">
          <span className="text-[11px] font-tech text-[#44474f] uppercase block">
            Histórico de Alertas
          </span>
          <span className="text-2xl font-geist font-bold text-[#ba1a1a] mt-1 block">
            {alerts.length}
          </span>
          <span className="text-[10px] font-tech text-[#ba1a1a] font-semibold">
            ● {alerts.filter((a) => a.type === 'unauthorized').length} Não Autorizados
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#c4c6d0]/50 p-4 shadow-xs">
          <span className="text-[11px] font-tech text-[#44474f] uppercase block">
            Câmeras Monitoradas
          </span>
          <span className="text-2xl font-geist font-bold text-[#006876] mt-1 block">
            {cameras.length}
          </span>
          <span className="text-[10px] font-tech text-[#006876] font-semibold">
            ● Transmissão RTSP / IP
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#c4c6d0]/50 p-4 shadow-xs">
          <span className="text-[11px] font-tech text-[#44474f] uppercase block">
            Motor de IA
          </span>
          <span className="text-2xl font-geist font-bold text-[#1a1c1e] mt-1 block">
            YOLOv8
          </span>
          <span className="text-[10px] font-tech text-emerald-600 font-semibold">
            ● Confiança {Math.round(config.yoloConfidence * 100)}%
          </span>
        </div>
      </div>

      {/* Main Export Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Data & Reports Download */}
        <section className="bg-white rounded-2xl border border-[#c4c6d0]/50 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#e1e2ec] pb-3">
            <Download className="w-5 h-5 text-[#005ac2]" />
            <h2 className="font-geist text-base font-bold text-[#1a1c1e]">
              Download de Dados e Relatórios
            </h2>
          </div>

          <div className="space-y-3">
            {/* Backup Completo */}
            <div className="bg-[#f7f9fb] p-3.5 rounded-xl border border-[#c4c6d0]/40 flex items-center justify-between gap-3">
              <div>
                <div className="font-geist text-sm font-bold text-[#1a1c1e] flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#005ac2]" />
                  Backup Geral da Aplicação (JSON)
                </div>
                <p className="text-xs text-[#44474f] mt-0.5">
                  Inclui todos os moradores, alertas, registros de câmeras e configurações.
                </p>
              </div>
              <button
                onClick={() => exportFullBackup(residents, alerts, config)}
                className="shrink-0 px-3.5 py-2 bg-[#005ac2] hover:bg-[#005ac2]/90 text-white rounded-lg text-xs font-tech font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            </div>

            {/* Moradores CSV */}
            <div className="bg-[#f7f9fb] p-3.5 rounded-xl border border-[#c4c6d0]/40 flex items-center justify-between gap-3">
              <div>
                <div className="font-geist text-sm font-bold text-[#1a1c1e] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#006876]" />
                  Tabela de Moradores (CSV / Excel)
                </div>
                <p className="text-xs text-[#44474f] mt-0.5">
                  Planilha com nomes, funções, códigos de apartamento e status biométrico.
                </p>
              </div>
              <button
                onClick={() => exportResidentsToCsv(residents)}
                className="shrink-0 px-3.5 py-2 bg-[#006876] hover:bg-[#006876]/90 text-white rounded-lg text-xs font-tech font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>

            {/* Alertas CSV */}
            <div className="bg-[#f7f9fb] p-3.5 rounded-xl border border-[#c4c6d0]/40 flex items-center justify-between gap-3">
              <div>
                <div className="font-geist text-sm font-bold text-[#1a1c1e] flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#ba1a1a]" />
                  Log de Alertas e Ocorrências (CSV)
                </div>
                <p className="text-xs text-[#44474f] mt-0.5">
                  Histórico completo de entradas não autorizadas e eventos de segurança.
                </p>
              </div>
              <button
                onClick={() => exportAlertsToCsv(alerts)}
                className="shrink-0 px-3.5 py-2 bg-[#ba1a1a] hover:bg-[#ba1a1a]/90 text-white rounded-lg text-xs font-tech font-bold transition-all shadow-xs flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>
        </section>

        {/* Right Column: Build & Deploy Commands */}
        <section className="bg-white rounded-2xl border border-[#c4c6d0]/50 p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b border-[#e1e2ec] pb-3">
            <Terminal className="w-5 h-5 text-[#006876]" />
            <h2 className="font-geist text-base font-bold text-[#1a1c1e]">
              Instruções de Compilação & Execução Local
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-tech text-[#44474f] mb-1">
                <span>Comandos de Inicialização (CLI)</span>
                <button
                  onClick={() => copyToClipboard(localRunSnippet, 'run')}
                  className="flex items-center gap-1 text-[#005ac2] hover:underline"
                >
                  {copiedScript === 'run' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript === 'run' ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="bg-[#121212] text-white font-tech text-xs p-3.5 rounded-xl overflow-x-auto custom-scrollbar">
                {localRunSnippet}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-tech text-[#44474f] mb-1">
                <span>Dockerfile para Container / Cloud Run</span>
                <button
                  onClick={() => copyToClipboard(standaloneDockerSnippet, 'docker')}
                  className="flex items-center gap-1 text-[#005ac2] hover:underline"
                >
                  {copiedScript === 'docker' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedScript === 'docker' ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <pre className="bg-[#121212] text-white font-tech text-xs p-3.5 rounded-xl overflow-x-auto custom-scrollbar max-h-36">
                {standaloneDockerSnippet}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
