import React from 'react';
import { LayoutGrid, Users, Bell, Settings, Download } from 'lucide-react';

export type NavTab = 'inicio' | 'moradores' | 'alertas' | 'configuracoes' | 'exportar';

interface NavigationProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  activeAlertsCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  activeAlertsCount,
}) => {
  const navItems = [
    { id: 'inicio', label: 'Início', icon: LayoutGrid },
    { id: 'moradores', label: 'Moradores', icon: Users },
    { id: 'alertas', label: 'Alertas', icon: Bell, badge: activeAlertsCount },
    { id: 'configuracoes', label: 'Configurações', icon: Settings },
    { id: 'exportar', label: 'Exportar / Backup', icon: Download },
  ];

  return (
    <>
      {/* Desktop Navigation Tabs - Subheader */}
      <div className="hidden md:block bg-white border-b border-[#e1e2ec]/60 px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <nav className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id as NavTab)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all relative ${
                    isActive
                      ? 'border-[#005ac2] text-[#005ac2] bg-[#d8e2ff]/20'
                      : 'border-transparent text-[#44474f] hover:text-[#1a1c1e] hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#005ac2]' : 'text-[#44474f]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-[#ba1a1a] text-white text-[11px] font-tech font-bold px-1.5 py-0.2 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar - Sticky bottom with glassmorphism */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white/95 backdrop-blur-xl border-t border-[#e1e2ec] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 pt-1 pb-3 flex justify-around items-center rounded-t-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id as NavTab)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all relative ${
                isActive
                  ? 'bg-[#c1e8ff] text-[#001e2b] font-semibold scale-105'
                  : 'text-[#44474f] hover:text-[#005ac2]'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#001e2b]' : 'text-[#44474f]'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#ba1a1a] text-white text-[9px] font-tech font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-tech mt-0.5 whitespace-nowrap">
                {item.label.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
