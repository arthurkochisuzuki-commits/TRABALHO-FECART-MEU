import React, { useState } from 'react';
import {
  UserPlus,
  Search,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Camera,
  X,
  Upload,
  Sparkles,
  Info
} from 'lucide-react';
import { Resident, RoleType } from '../types';
import { exportResidentsToCsv } from '../utils/exportUtils';
import { soundFx } from '../utils/soundUtils';

interface ResidentsViewProps {
  residents: Resident[];
  onAddResident: (newResident: Omit<Resident, 'id' | 'createdAt'>) => void;
  onDeleteResident: (id: string) => void;
}

export const ResidentsView: React.FC<ResidentsViewProps> = ({
  residents,
  onAddResident,
  onDeleteResident,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Resident Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<RoleType>('owner');
  const [unitCode, setUnitCode] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const presetPhotos = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
  ];

  const filteredResidents = residents.filter((res) => {
    const matchesSearch =
      res.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      res.unitCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || res.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenModal = () => {
    setName('');
    setRole('owner');
    setUnitCode('');
    setPhotoUrl(presetPhotos[Math.floor(Math.random() * presetPhotos.length)]);
    setIsModalOpen(true);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    let roleLabel = 'Proprietário';
    if (role === 'resident') roleLabel = 'Morador';
    if (role === 'employee') roleLabel = 'Funcionário';
    if (role === 'guest') roleLabel = 'Convidado';

    onAddResident({
      name: name.trim(),
      role,
      roleLabel,
      unitCode: unitCode.trim() || '4A-000',
      photoUrl: photoUrl || presetPhotos[0],
      status,
      expiresAt: role === 'guest' ? 'Expira em 24h' : undefined,
      confidenceAverage: 98.5,
    });

    soundFx.playAccessGranted();
    setIsModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPhotoUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#e1e2ec] pb-5">
        <div>
          <h1 className="font-geist text-2xl md:text-3xl font-bold text-[#1a1c1e] tracking-tight">
            Moradores Cadastrados
          </h1>
          <p className="text-sm font-inter text-[#44474f] mt-1">
            Monitorando {residents.length} perfis autorizados via Supabase Local Server.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportResidentsToCsv(residents)}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-[#c4c6d0]/60 bg-white hover:bg-gray-50 text-[#44474f] text-xs font-tech font-medium transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#006876]" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handleOpenModal}
            className="flex items-center gap-2 bg-[#005ac2] hover:bg-[#005ac2]/90 active:scale-95 text-white px-4 py-2 rounded-lg font-tech text-xs font-semibold tracking-wider transition-all shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Adicionar Novo Morador</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#74777f] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome ou ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-[#c4c6d0]/60 text-xs font-inter text-[#1a1c1e] rounded-lg pl-9 pr-3 py-2 outline-none focus:border-[#005ac2] focus:ring-1 focus:ring-[#005ac2] transition-all shadow-xs"
          />
        </div>

        {/* Role Filters */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'owner', label: 'Proprietários' },
            { id: 'resident', label: 'Moradores' },
            { id: 'employee', label: 'Funcionários' },
            { id: 'guest', label: 'Convidados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-tech whitespace-nowrap transition-colors ${
                roleFilter === tab.id
                  ? 'bg-[#d8e2ff] text-[#001a42] font-semibold'
                  : 'bg-white text-[#44474f] border border-[#c4c6d0]/40 hover:text-[#1a1c1e]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bento Grid for Residents matching Screen 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResidents.map((res) => {
          const isGuest = res.role === 'guest';
          const isActive = res.status === 'active';

          return (
            <div
              key={res.id}
              className="glass-panel rounded-xl p-4 flex items-center gap-3.5 relative overflow-hidden group hover:border-[#006876]/50 hover:shadow-md transition-all"
            >
              {/* Active hover edge */}
              <div className="absolute top-0 right-0 w-1 h-full bg-[#006876] opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Avatar with Facial Recognition HUD brackets */}
              <div className="relative w-12 h-12 shrink-0">
                <img
                  src={res.photoUrl}
                  alt={res.name}
                  className="w-full h-full rounded-full object-cover border border-[#c4c6d0]/40 shadow-xs"
                />
                {/* HUD scan cyan corners */}
                <div className="absolute top-0 left-0 border-l border-t border-[#006876] w-2 h-2 hud-scan" />
                <div className="absolute bottom-0 right-0 border-r border-b border-[#006876] w-2 h-2 hud-scan" />
              </div>

              {/* Resident Metadata */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className="font-geist text-sm md:text-base font-semibold text-[#1a1c1e] truncate">
                    {res.name}
                  </h3>
                  {/* Status dot */}
                  <span
                    title={isActive ? 'Status: Ativo' : 'Status: Inativo / Expirado'}
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-[#006876] shadow-[0_0_8px_rgba(0,104,118,0.6)]'
                        : 'bg-[#74777f]'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 text-xs font-tech">
                  <span
                    className={`uppercase tracking-wider font-semibold text-[10px] ${
                      isGuest ? 'text-[#74777f]' : 'text-[#006876]'
                    }`}
                  >
                    {res.roleLabel}
                  </span>
                  <span className="text-[#44474f]/70 text-[10px]">
                    {isGuest && res.expiresAt ? res.expiresAt : `ID: ${res.unitCode}`}
                  </span>
                </div>
              </div>

              {/* Quick Delete action on hover */}
              <button
                onClick={() => onDeleteResident(res.id)}
                title="Excluir cadastro"
                className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-[#ba1a1a] rounded transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <button
        onClick={handleOpenModal}
        aria-label="Adicionar Morador"
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-[#005ac2] text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-transform"
      >
        <UserPlus className="w-6 h-6" />
      </button>

      {/* Add Resident Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel relative w-full max-w-lg rounded-2xl p-6 flex flex-col bg-white shadow-2xl border border-[#c4c6d0]/60 max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Close button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#44474f] hover:text-[#1a1c1e] p-1 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div className="mb-5">
              <h2 className="font-geist text-xl font-bold text-[#1a1c1e] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#006876]" />
                Registrar Perfil
              </h2>
              <p className="text-[11px] font-tech text-[#44474f]/80 mt-0.5 uppercase tracking-wider">
                Dados armazenados localmente via Supabase
              </p>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Name Field */}
              <div className="space-y-1">
                <label className="text-xs font-tech font-semibold text-[#44474f] uppercase">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Eduardo Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#f7f9fb] border border-[#c4c6d0]/60 rounded-lg p-2.5 text-sm font-inter text-[#1a1c1e] outline-none focus:border-[#006876] focus:ring-1 focus:ring-[#006876] transition-all"
                />
              </div>

              {/* Role and Unit Code Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-tech font-semibold text-[#44474f] uppercase">
                    Nível de Acesso
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as RoleType)}
                    className="w-full bg-[#f7f9fb] border border-[#c4c6d0]/60 rounded-lg p-2.5 text-xs font-tech text-[#1a1c1e] outline-none focus:border-[#006876]"
                  >
                    <option value="owner">Proprietário (Acesso Total)</option>
                    <option value="resident">Morador (Acesso Padrão)</option>
                    <option value="employee">Funcionário (Serviço)</option>
                    <option value="guest">Convidado (Temporário 24h)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-tech font-semibold text-[#44474f] uppercase">
                    ID / Unidade
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 4A-992"
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-[#c4c6d0]/60 rounded-lg p-2.5 text-sm font-inter text-[#1a1c1e] outline-none focus:border-[#006876]"
                  />
                </div>
              </div>

              {/* Facial Training Data & Photo Upload */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-tech font-semibold text-[#44474f] uppercase">
                    Dados de Treinamento Facial
                  </span>
                  <span className="text-[11px] font-tech text-[#006876] flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" /> Vetores Biométricos
                  </span>
                </div>

                {/* Photo Preview & Options */}
                <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#f2f4f6] p-3 rounded-xl border border-[#c4c6d0]/40">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#006876] shrink-0">
                    <img src={photoUrl || presetPhotos[0]} alt="Preview" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 text-center sm:text-left space-y-1">
                    <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                      {presetPhotos.slice(0, 4).map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPhotoUrl(p)}
                          className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all ${
                            photoUrl === p ? 'border-[#005ac2] scale-110' : 'border-transparent opacity-60'
                          }`}
                        >
                          <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    <label className="cursor-pointer inline-flex items-center gap-1.5 text-xs font-tech text-[#005ac2] hover:underline pt-1">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Carregar foto personalizada</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <p className="text-[10px] font-tech text-[#44474f]/70 text-center">
                  Requer visão frontal clara e sem obstruções para modelagem de IA YOLOv8.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-[#e1e2ec]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#c4c6d0] text-[#44474f] hover:bg-gray-50 text-xs font-tech font-medium transition-colors"
                >
                  CANCELAR
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-[#005ac2] hover:bg-[#005ac2]/90 active:scale-95 text-white text-xs font-tech font-bold tracking-wider transition-all shadow-md"
                >
                  INICIALIZAR PERFIL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
