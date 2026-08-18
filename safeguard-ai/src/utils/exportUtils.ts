import { Resident, SecurityAlert, SystemConfig } from '../types';

export function exportToJson(data: unknown, filename: string) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportResidentsToCsv(residents: Resident[]) {
  const headers = ['ID', 'Nome', 'Funcao', 'Cargo', 'Unidade', 'Status', 'CriadoEm', 'UltimaVisto', 'ConfiancaMedia'];
  const rows = residents.map((r) => [
    r.id,
    `"${r.name.replace(/"/g, '""')}"`,
    r.role,
    r.roleLabel,
    r.unitCode,
    r.status,
    r.createdAt,
    r.lastSeen || '',
    r.confidenceAverage || '',
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `safeguard_moradores_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export function exportAlertsToCsv(alerts: SecurityAlert[]) {
  const headers = ['ID', 'Timestamp', 'Data', 'Tipo', 'Titulo', 'Camera', 'Localizacao', 'Pessoa', 'Confianca', 'Status', 'Descricao'];
  const rows = alerts.map((a) => [
    a.id,
    a.timestamp,
    a.date,
    a.type,
    `"${a.title.replace(/"/g, '""')}"`,
    a.cameraCode,
    `"${a.cameraLocation.replace(/"/g, '""')}"`,
    `"${(a.residentName || 'Desconhecido').replace(/"/g, '""')}"`,
    a.confidenceLabel || `${a.confidence || 0}%`,
    a.status,
    `"${(a.description || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `safeguard_alertas_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export interface BackupPayload {
  exportDate: string;
  app: string;
  version: string;
  residents: Resident[];
  alerts: SecurityAlert[];
  config: SystemConfig;
}

export function exportFullBackup(residents: Resident[], alerts: SecurityAlert[], config: SystemConfig) {
  const backup: BackupPayload = {
    exportDate: new Date().toISOString(),
    app: 'SafeGuard AI',
    version: '2.4.0',
    residents,
    alerts,
    config,
  };
  exportToJson(backup, `safeguard_backup_completo_${new Date().toISOString().slice(0, 10)}.json`);
}
