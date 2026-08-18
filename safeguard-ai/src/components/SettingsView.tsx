import React, { useState } from 'react';
import {
  Palette,
  AlertTriangle,
  Database,
  Sliders,
  Code2,
  Check,
  RotateCcw,
  Download,
  Upload,
  Server,
  FileSpreadsheet,
  FileJson,
  ShieldAlert,
  Volume2
} from 'lucide-react';
import { SystemConfig, PrimaryColor, DataDensity, Resident, SecurityAlert } from '../types';
import { exportFullBackup, exportToJson } from '../utils/exportUtils';
import { defaultModelConfigJson } from '../data/mockData';

interface SettingsViewProps {
  config: SystemConfig;
  residents: Resident[];
  alerts: SecurityAlert[];
  onUpdateConfig: (newConfig: Partial<SystemConfig>) => void;
  onResetDefaults: () => void;
  onImportBackup: (importedData: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  residents,
  alerts,
  onUpdateConfig,
  onResetDefaults,
  onImportBackup,
}) => {
  const [jsonContent, setJsonContent] = useState<string>(config.modelConfigJson || defaultModelConfigJson);
  const [jsonSavedFeedback, setJsonSavedFeedback] = useState(false);
  const [testConnFeedback, setTestConnFeedback] = useState<'idle' | 'testing' | 'success'>('idle');

  const colorOptions: { id: PrimaryColor; colorClass: string; label: string }[] = [
    { id: 'cyan', colorClass: 'bg-[#006783]', label: 'Ciano' },
    { id: 'blue', colorClass: 'bg-[#005ac2]', label: 'Azul' },
    { id: 'slate', colorClass: 'bg-[#535f70]', label: 'Cinza' },
    { id: 'red', colorClass: 'bg-[#ba1a1a]', label: 'Vermelho' },
  ];

  const handleApplyJson = () => {
    try {
      JSON.parse(jsonContent);
      onUpdateConfig({ modelConfigJson: jsonContent });
      setJsonSavedFeedback(true);
      setTimeout(() => setJsonSavedFeedback(false), 2500);
    } catch {
      alert('Erro: JSON inválido. Verifique a sintaxe antes de aplicar.');
    }
  };

  const handleTestConnection = () => {
    setTestConnFeedback('testing');
    setTimeout(() => {
      setTestConnFeedback('success');
      setTimeout(() => setTestConnFeedback('idle'), 3000);
    }, 800);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content);
          onImportBackup(parsed);
          alert('Backup importado com sucesso!');
        } catch {
          alert('Arquivo de backup inválido.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="border-b border-[#e1e2ec] pb-5">
        <h1 className="font-geist text-2xl md:text-3xl font-bold text-[#1a1c1e] tracking-tight">
          Configurações do Sistema
        </h1>
        <p className="text-sm font-inter text-[#44474f] mt-1">
          Gerencie variáveis de ambiente e matrizes sensoriais.
        </p>
      </div>

      {/* Main Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: UI Aesthetics (Span 4) */}
        <section className="lg:col-span-4 bg-white rounded-2xl border border-[#c4c6d0]/50 p-5 shadow-sm flex flex-col gap-5">
          <header className="flex items-center gap-2.5 border-b border-[#e1e2ec] pb-3">
            <Palette className="w-5 h-5 text-[#005ac2]" />
            <h2 className="font-geist text-base font-bold text-[#1a1c1e]">
              Estética da Interface
            </h2>
          </header>

          {/* Density Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-tech text-[#44474f] uppercase tracking-wider block font-semibold">
              Densidade de Dados
            </label>
            <div className="flex bg-[#f2f4f6] rounded-xl p-1 border border-[#c4c6d0]/40">
              <button
                onClick={() => onUpdateConfig({ density: 'compact' })}
                className={`flex-1 py-2 text-xs font-tech rounded-lg transition-all ${
                  config.density === 'compact'
                    ? 'bg-[#c1e8ff] text-[#001e2b] font-bold shadow-xs'
                    : 'text-[#44474f] hover:text-[#1a1c1e]'
                }`}
              >
                Compacto
              </button>
              <button
                onClick={() => onUpdateConfig({ density: 'relaxed' })}
                className={`flex-1 py-2 text-xs font-tech rounded-lg transition-all ${
                  config.density === 'relaxed'
                    ? 'bg-[#c1e8ff] text-[#001e2b] font-bold shadow-xs'
                    : 'text-[#44474f] hover:text-[#1a1c1e]'
                }`}
              >
                Relaxado
              </button>
            </div>
          </div>

          {/* Primary Accent Color */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-tech text-[#44474f] uppercase tracking-wider block font-semibold">
              Cor Principal
            </label>
            <div className="flex items-center gap-3">
              {colorOptions.map((opt) => {
                const isSelected = config.primaryColor === opt.id;
                return (
                  <button
                    key={opt.id}
                    title={opt.label}
                    onClick={() => onUpdateConfig({ primaryColor: opt.id })}
                    className={`w-9 h-9 rounded-full ${opt.colorClass} border-2 transition-all ${
                      isSelected
                        ? 'border-black ring-2 ring-[#005ac2]/40 scale-110 shadow-md'
                        : 'border-white opacity-80 hover:opacity-100'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Backup and Data Export Hub */}
          <div className="pt-4 border-t border-[#e1e2ec] space-y-3 mt-auto">
            <label className="text-xs font-tech text-[#44474f] uppercase tracking-wider block font-semibold">
              Exportação & Backup
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => exportFullBackup(residents, alerts, config)}
                className="flex items-center justify-center gap-1.5 p-2 bg-[#f7f9fb] hover:bg-[#d8e2ff]/40 border border-[#c4c6d0]/50 rounded-lg text-xs font-tech text-[#005ac2] font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Backup JSON</span>
              </button>

              <label className="cursor-pointer flex items-center justify-center gap-1.5 p-2 bg-[#f7f9fb] hover:bg-gray-100 border border-[#c4c6d0]/50 rounded-lg text-xs font-tech text-[#44474f] font-semibold transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Restaurar</span>
                <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
              </label>
            </div>

            <button
              onClick={() => {
                if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
                  onResetDefaults();
                }
              }}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-tech text-[#ba1a1a] hover:bg-red-50 rounded-lg transition-colors border border-red-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Redefinir Dados de Demonstração</span>
            </button>
          </div>
        </section>

        {/* Right Column: Full Stack Developer Mode (Span 8) */}
        <section className="lg:col-span-8 bg-white rounded-2xl border border-[#c4c6d0]/50 shadow-sm overflow-hidden flex flex-col">
          {/* Developer Mode Banner */}
          <div className="bg-[#ffdad6]/40 border-b border-[#ba1a1a]/20 p-3.5 flex items-center justify-between px-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#ba1a1a]" />
              <h2 className="font-geist text-sm md:text-base font-bold text-[#ba1a1a] uppercase tracking-wider">
                Modo Desenvolvedor
              </h2>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.developerMode}
                onChange={(e) => onUpdateConfig({ developerMode: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ba1a1a] relative" />
            </label>
          </div>

          <div className="p-5 flex flex-col gap-5 flex-1">
            {/* Top Grid: Supabase & YOLO Confidence */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Supabase Config */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[#006876]">
                  <div className="flex items-center gap-1.5">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-tech font-bold uppercase">
                      Conexões de Nó de Dados
                    </span>
                  </div>
                  <button
                    onClick={handleTestConnection}
                    className="text-[10px] font-tech underline hover:text-[#005ac2]"
                  >
                    {testConnFeedback === 'testing'
                      ? 'Testando...'
                      : testConnFeedback === 'success'
                      ? '✓ Conectado'
                      : 'Testar Ping'}
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-tech text-[#44474f]">URL do Supabase</label>
                  <input
                    type="text"
                    value={config.supabaseUrl}
                    onChange={(e) => onUpdateConfig({ supabaseUrl: e.target.value })}
                    className="w-full bg-[#f7f9fb] border border-[#c4c6d0]/60 text-xs font-tech text-[#1a1c1e] rounded-lg p-2.5 outline-none focus:border-[#006876] transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-tech text-[#44474f]">Chave Anon</label>
                  <input
                    type="password"
                    value={config.supabaseAnonKey}
                    onChange={(e) => onUpdateConfig({ supabaseAnonKey: e.target.value })}
                    className="w-full bg-[#f7f9fb] border border-[#c4c6d0]/60 text-xs font-tech text-[#1a1c1e] rounded-lg p-2.5 outline-none focus:border-[#006876] transition-all"
                  />
                </div>
              </div>

              {/* YOLO Confidence Slider */}
              <div className="space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[#006876] mb-2">
                    <div className="flex items-center gap-1.5">
                      <Sliders className="w-4 h-4" />
                      <span className="text-xs font-tech font-bold uppercase">
                        Confiança do YOLOv8
                      </span>
                    </div>
                    <span className="text-xs font-tech font-bold bg-[#006876]/10 text-[#006876] px-2 py-0.5 rounded border border-[#006876]/20">
                      {config.yoloConfidence.toFixed(2)}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0.10"
                    max="0.99"
                    step="0.01"
                    value={config.yoloConfidence}
                    onChange={(e) =>
                      onUpdateConfig({ yoloConfidence: parseFloat(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#006876]"
                  />

                  <div className="flex justify-between text-[11px] font-tech text-[#44474f] mt-1">
                    <span>Alto Recall</span>
                    <span>Alta Precisão</span>
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-2 flex flex-wrap gap-4 border-t border-[#e1e2ec]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.webhooksEnabled}
                      onChange={(e) => onUpdateConfig({ webhooksEnabled: e.target.checked })}
                      className="rounded text-[#006876] focus:ring-[#006876]"
                    />
                    <span className="text-xs font-tech text-[#44474f]">Webhooks</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.debugLogsEnabled}
                      onChange={(e) => onUpdateConfig({ debugLogsEnabled: e.target.checked })}
                      className="rounded text-[#006876] focus:ring-[#006876]"
                    />
                    <span className="text-xs font-tech text-[#44474f]">Logs de Depuração</span>
                  </label>
                </div>
              </div>
            </div>

            {/* JSON Code Editor Array */}
            <div className="flex flex-col flex-1 mt-2">
              <div className="flex items-center justify-between bg-[#eceef0] border border-[#c4c6d0]/60 rounded-t-xl px-3.5 py-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-[#44474f]" />
                  <span className="text-xs font-tech text-[#1a1c1e] font-semibold">
                    model_config.json
                  </span>
                </div>
                <button
                  onClick={handleApplyJson}
                  className="text-xs font-tech font-bold text-[#006876] hover:text-[#005ac2] transition-colors flex items-center gap-1"
                >
                  {jsonSavedFeedback ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Salvo!</span>
                    </>
                  ) : (
                    'Aplicar Configuração'
                  )}
                </button>
              </div>

              <div className="bg-[#ffffff] border-x border-b border-[#c4c6d0]/60 rounded-b-xl p-3 flex relative shadow-inner">
                {/* Line numbers column */}
                <div className="w-7 select-none border-r border-[#e1e2ec] pr-2 text-right text-xs font-tech text-[#74777f]/70 space-y-1">
                  <div>1</div>
                  <div>2</div>
                  <div>3</div>
                  <div>4</div>
                  <div>5</div>
                  <div>6</div>
                  <div>7</div>
                  <div>8</div>
                </div>

                {/* Code Textarea */}
                <textarea
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  rows={8}
                  spellCheck={false}
                  className="w-full bg-transparent text-xs font-tech text-[#1a1c1e] pl-3 border-none focus:ring-0 resize-none outline-none custom-scrollbar"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
