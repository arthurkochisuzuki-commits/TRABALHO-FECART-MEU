/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Navigation, NavTab } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { AlertsView } from './components/AlertsView';
import { ResidentsView } from './components/ResidentsView';
import { SettingsView } from './components/SettingsView';
import { ExportView } from './components/ExportView';
import { AlertDetailModal } from './components/AlertDetailModal';
import {
  initialResidents,
  initialAlerts,
  initialCameras,
  initialConfig,
} from './data/mockData';
import { Resident, SecurityAlert, CameraFeed, SystemConfig } from './types';
import { soundFx } from './utils/soundUtils';

export default function App() {
  // Persistence with localStorage fallback
  const [residents, setResidents] = useState<Resident[]>(() => {
    try {
      const saved = localStorage.getItem('safeguard_residents');
      return saved ? JSON.parse(saved) : initialResidents;
    } catch {
      return initialResidents;
    }
  });

  const [alerts, setAlerts] = useState<SecurityAlert[]>(() => {
    try {
      const saved = localStorage.getItem('safeguard_alerts');
      return saved ? JSON.parse(saved) : initialAlerts;
    } catch {
      return initialAlerts;
    }
  });

  const [cameras, setCameras] = useState<CameraFeed[]>(initialCameras);

  const [config, setConfig] = useState<SystemConfig>(() => {
    try {
      const saved = localStorage.getItem('safeguard_config');
      return saved ? JSON.parse(saved) : initialConfig;
    } catch {
      return initialConfig;
    }
  });

  const [currentTab, setCurrentTab] = useState<NavTab>('inicio');
  const [selectedAlertForDetail, setSelectedAlertForDetail] = useState<SecurityAlert | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('safeguard_residents', JSON.stringify(residents));
    } catch {}
  }, [residents]);

  useEffect(() => {
    try {
      localStorage.setItem('safeguard_alerts', JSON.stringify(alerts));
    } catch {}
  }, [alerts]);

  useEffect(() => {
    try {
      localStorage.setItem('safeguard_config', JSON.stringify(config));
    } catch {}
  }, [config]);

  // Active alerts count
  const activeAlertsCount = alerts.filter(
    (a) => a.type === 'unauthorized' && a.status === 'active'
  ).length;

  // Add resident
  const handleAddResident = (newResident: Omit<Resident, 'id' | 'createdAt'>) => {
    const created: Resident = {
      ...newResident,
      id: `res-${Date.now()}`,
      createdAt: new Date().toISOString().slice(0, 10),
      lastSeen: new Date().toTimeString().split(' ')[0],
      lastLocation: 'Portaria Principal',
    };
    setResidents((prev) => [created, ...prev]);
  };

  // Delete resident
  const handleDeleteResident = (id: string) => {
    setResidents((prev) => prev.filter((r) => r.id !== id));
  };

  // Escalate Alert
  const handleEscalateAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'escalated' } : a))
    );
  };

  // Resolve Alert
  const handleResolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, status: 'resolved' } : a))
    );
  };

  // Update Config
  const handleUpdateConfig = (newConfig: Partial<SystemConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Reset defaults
  const handleResetDefaults = () => {
    setResidents(initialResidents);
    setAlerts(initialAlerts);
    setCameras(initialCameras);
    setConfig(initialConfig);
    localStorage.removeItem('safeguard_residents');
    localStorage.removeItem('safeguard_alerts');
    localStorage.removeItem('safeguard_config');
    soundFx.playAccessGranted();
  };

  // Import full backup
  const handleImportBackup = (backupData: any) => {
    if (backupData.residents) setResidents(backupData.residents);
    if (backupData.alerts) setAlerts(backupData.alerts);
    if (backupData.config) setConfig(backupData.config);
    soundFx.playAccessGranted();
  };

  // Live Simulation Trigger
  const handleSimulateEvent = () => {
    const isIntruder = Math.random() > 0.4;
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const dateStr = `${now.getDate()} OUT`;

    if (isIntruder) {
      if (config.soundAlarmsEnabled) {
        soundFx.playAlertAlarm();
      }
      const newAlert: SecurityAlert = {
        id: `alt-${Date.now()}`,
        timestamp: timeStr,
        date: dateStr,
        type: 'unauthorized',
        title: 'Tentativa de Acesso Não Autorizada',
        cameraCode: 'CAM-EXT-04',
        cameraLocation: 'Doca de Carga Traseira',
        confidence: 0,
        confidenceLabel: 'DESCONHECIDO (0%)',
        status: 'active',
        snapshotUrl:
          'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&auto=format&fit=crop&q=80',
        description: 'Detecção de indivíduo sem cadastro facial em área restrita.',
        details: 'Classificação YOLOv8: [person 98.6%, unknown_face 0%]. Alerta enviado ao painel.',
      };
      setAlerts((prev) => [newAlert, ...prev]);
    } else {
      if (config.soundAlarmsEnabled) {
        soundFx.playAccessGranted();
      }
      const randomResident = residents[Math.floor(Math.random() * residents.length)] || residents[0];
      const newAlert: SecurityAlert = {
        id: `alt-${Date.now()}`,
        timestamp: timeStr,
        date: dateStr,
        type: 'authorized',
        title: 'Entrada Autorizada',
        cameraCode: 'CAM-INT-01',
        cameraLocation: 'Saguão Principal',
        residentName: randomResident.name,
        residentAvatar: randomResident.photoUrl,
        residentRole: randomResident.roleLabel,
        confidence: 98.9,
        confidenceLabel: 'CORRESPONDÊNCIA: 98.9%',
        status: 'resolved',
        description: `Acesso verificado via torniquete principal para ${randomResident.name}.`,
      };
      setAlerts((prev) => [newAlert, ...prev]);
    }
  };

  return (
    <div className={`min-h-screen bg-[#f7f9fb] text-[#1a1c1e] flex flex-col font-inter pb-20 md:pb-8 ${
      config.density === 'compact' ? 'text-xs' : 'text-sm'
    }`}>
      {/* Top Main Header */}
      <Header
        config={config}
        onUpdateConfig={handleUpdateConfig}
        activeAlertsCount={activeAlertsCount}
        onSimulateEvent={handleSimulateEvent}
      />

      {/* Navigation Subheader / Mobile bar */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeAlertsCount={activeAlertsCount}
      />

      {/* Main View Container */}
      <main className="flex-1">
        {currentTab === 'inicio' && (
          <DashboardView
            cameras={cameras}
            alerts={alerts}
            residents={residents}
            config={config}
            onViewAlertDetails={(alert) => setSelectedAlertForDetail(alert)}
          />
        )}

        {currentTab === 'moradores' && (
          <ResidentsView
            residents={residents}
            onAddResident={handleAddResident}
            onDeleteResident={handleDeleteResident}
          />
        )}

        {currentTab === 'alertas' && (
          <AlertsView
            alerts={alerts}
            onEscalateAlert={handleEscalateAlert}
            onResolveAlert={handleResolveAlert}
            onViewDetails={(alert) => setSelectedAlertForDetail(alert)}
          />
        )}

        {currentTab === 'configuracoes' && (
          <SettingsView
            config={config}
            residents={residents}
            alerts={alerts}
            onUpdateConfig={handleUpdateConfig}
            onResetDefaults={handleResetDefaults}
            onImportBackup={handleImportBackup}
          />
        )}

        {currentTab === 'exportar' && (
          <ExportView
            residents={residents}
            alerts={alerts}
            cameras={cameras}
            config={config}
          />
        )}
      </main>

      {/* Alert Detail Modal */}
      <AlertDetailModal
        alert={selectedAlertForDetail}
        onClose={() => setSelectedAlertForDetail(null)}
        onEscalate={handleEscalateAlert}
        onResolve={handleResolveAlert}
      />
    </div>
  );
}
