/**
 * utils.js — Pure utility functions (no DOM dependencies)
 * Rede D'Or Portal de Atendimento
 */

'use strict';

/* ── LABEL MAPS ─────────────────────────────────────────────────────────── */
const STATUS_LABELS = {
  aberto:       'Aberto',
  em_andamento: 'Em Andamento',
  resolvido:    'Resolvido',
  fechado:      'Fechado',
};

const PRIORITY_LABELS = {
  urgente: 'Urgente',
  alto:    'Alto',
  normal:  'Normal',
};

const TYPE_LABELS = {
  ART: '🎨 Criação',
  EVT: '🎪 Eventos',
  PAT: '🤝 Patrocínio',
};

const SLA_LABELS = {
  no_prazo: 'No Prazo',
  urgencia: 'Com Urgência',
  atrasado: 'Atrasado',
};

const PRIORITY_ORDER = { urgente: 0, alto: 1, normal: 2 };

const SECTOR_META = {
  ART: { label: '🎨 Criação',    color: '#a855f7', bg: 'rgba(168,85,247,0.1)', border: 'rgba(168,85,247,0.25)', cssClass: 'art' },
  EVT: { label: '🎪 Eventos',    color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)', cssClass: 'evt' },
  PAT: { label: '🤝 Patrocínio', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', cssClass: 'pat' },
};

/* ── FORMATTERS ─────────────────────────────────────────────────────────── */
function statusLabel(s)   { return STATUS_LABELS[s]   || s; }
function priorityLabel(p) { return PRIORITY_LABELS[p] || p; }
function typeLabel(t)     { return TYPE_LABELS[t]     || t; }
function slaLabel(s)      { return SLA_LABELS[s]      || s; }

function fmtDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function fmtDateTime(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtMonthYear(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

/* ── STORAGE HELPERS ────────────────────────────────────────────────────── */
function getUsers()   { return JSON.parse(localStorage.getItem('sdr_users')   || '[]'); }
function getTickets() { return JSON.parse(localStorage.getItem('sdr_tickets') || '[]'); }
function saveTickets(arr) { localStorage.setItem('sdr_tickets', JSON.stringify(arr)); }

function getUserName(id) {
  if (!id) return 'Não atribuído';
  const u = getUsers().find(u => u.id === id);
  return u ? u.name : '—';
}

/* ── TICKET HELPERS ─────────────────────────────────────────────────────── */
function computeSlaStatus(ticket) {
  const now = new Date();
  const deadline = ticket.deadline ? new Date(ticket.deadline) : null;
  if (deadline && now > deadline) return 'atrasado';
  if (ticket.priority === 'urgente') return 'urgencia';
  return 'no_prazo';
}

/** Returns tickets visible to the current session (sector-scoped or all for admin) */
function getScopedTickets(session) {
  const all = getTickets();
  if (!session || session.role === 'admin' || !session.sector) return all;
  return all.filter(t => t.type === session.sector);
}

/* ── PERIOD FILTER ──────────────────────────────────────────────────────── */
/**
 * @param {Array} tickets
 * @param {{ type: 'all'|'month', month: number|null, year: number|null }} period
 */
function filterByPeriod(tickets, period) {
  if (!period || period.type === 'all') return tickets;
  return tickets.filter(t => {
    const d = new Date(t.createdAt);
    if (period.year  !== null && d.getFullYear() !== period.year)  return false;
    if (period.month !== null && d.getMonth()    !== period.month) return false;
    return true;
  });
}

/** Last N months with labels */
function getMonthlyBreakdown(tickets, months = 6) {
  const now = new Date();
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push({
      label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
      year:  d.getFullYear(),
      month: d.getMonth(),
      total: 0,
      resolvido: 0,
    });
  }
  tickets.forEach(t => {
    const d = new Date(t.createdAt);
    const m = result.find(r => r.year === d.getFullYear() && r.month === d.getMonth());
    if (m) {
      m.total++;
      if (t.resolvedAt) m.resolvido++;
    }
  });
  return result;
}

/** Unique years present in ticket data */
function getTicketYears(tickets) {
  const years = [...new Set(tickets.map(t => new Date(t.createdAt).getFullYear()))];
  return years.sort((a, b) => b - a);
}

/* ── CSV EXPORT ─────────────────────────────────────────────────────────── */
function exportToCSV(tickets, filename = 'relatorio') {
  const headers = [
    'Protocolo', 'Tipo', 'Título', 'Status', 'Prioridade',
    'Usuário', 'Analista', 'Aberto em', 'Prazo', 'Resolvido em', 'SLA',
  ];
  const rows = tickets.map(t => [
    t.id,
    t.type,
    t.title,
    statusLabel(t.status),
    priorityLabel(t.priority),
    getUserName(t.userId),
    getUserName(t.analystId),
    fmtDate(t.createdAt),
    fmtDate(t.deadline),
    fmtDate(t.resolvedAt),
    t.resolvedAt ? slaLabel(t.slaStatus) : '—',
  ]);

  const escape = v => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map(r => r.map(escape).join(',')).join('\r\n');

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ── EMAIL SHARE ────────────────────────────────────────────────────────── */
function shareByEmail(tickets, periodLabel, sectorLabel) {
  const total     = tickets.length;
  const abertos   = tickets.filter(t => t.status === 'aberto').length;
  const andamento = tickets.filter(t => t.status === 'em_andamento').length;
  const resolvidos= tickets.filter(t => ['resolvido','fechado'].includes(t.status)).length;
  const resolved  = tickets.filter(t => t.resolvedAt);
  const noPrazo   = resolved.filter(t => t.slaStatus === 'no_prazo').length;
  const slaPct    = resolved.length ? Math.round((noPrazo / resolved.length) * 100) : 0;

  const artCount = tickets.filter(t => t.type === 'ART').length;
  const evtCount = tickets.filter(t => t.type === 'EVT').length;
  const patCount = tickets.filter(t => t.type === 'PAT').length;

  const subject = `Relatório de Chamados${sectorLabel ? ' · ' + sectorLabel : ''} — ${periodLabel}`;
  const body = [
    `RELATÓRIO DE CHAMADOS — REDE D'OR`,
    `${sectorLabel ? 'Setor: ' + sectorLabel + '\n' : ''}Período: ${periodLabel}`,
    '',
    '═══ RESUMO ═══',
    `Total de chamados:   ${total}`,
    `Abertos:             ${abertos}`,
    `Em andamento:        ${andamento}`,
    `Resolvidos/Fechados: ${resolvidos}`,
    `SLA em dia:          ${slaPct}% (${noPrazo} de ${resolved.length})`,
    '',
    '═══ POR TIPO ═══',
    `🎨 Criação (ART):    ${artCount}`,
    `🎪 Eventos (EVT):    ${evtCount}`,
    `🤝 Patrocínio (PAT): ${patCount}`,
    '',
    `Gerado em ${new Date().toLocaleString('pt-BR')}`,
  ].join('\n');

  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
