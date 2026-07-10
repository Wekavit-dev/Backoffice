// Libellés français simples pour le module Accompagnement (SSS).
// On évite le jargon technique (S1, NBA, healthScore…) dans l’interface.

export const STAGE_LABELS = {
  S0: 'Prospect',
  S1: 'Nouveau',
  S2: 'Compte prêt',
  S3: 'Compte inactif',
  S4: 'Premier dépôt fait',
  S5: 'Premier plan créé',
  S6: 'Premier versement',
  S7: 'Épargnant actif',
  S8: 'Épargnant fidèle',
  S9: 'Champion',
  S10: 'Ambassadeur',
  S11: 'En pause',
  S12: 'À réveiller',
  S13: 'Inactif longtemps'
};

export const STAGE_OPTIONS = Object.entries(STAGE_LABELS).map(([value, label]) => ({ value, label }));

export const URGENCY_LABELS = {
  critical: 'Urgent',
  high: 'Prioritaire',
  medium: 'À suivre',
  low: 'Tranquille'
};

export const URGENCY_COLORS = {
  critical: 'error',
  high: 'warning',
  medium: 'info',
  low: 'default'
};

export const HEALTH_LABELS = {
  excellent: 'Excellent',
  good: 'Bon',
  watch: 'À surveiller',
  critical: 'Fragile'
};

export const HEALTH_COLORS = {
  excellent: 'success',
  good: 'info',
  watch: 'warning',
  critical: 'error'
};

export const ALERT_LABELS = {
  NEVER_DEPOSITED: 'Jamais déposé',
  PENDING_DEPOSIT_STUCK: 'Dépôt en attente trop long',
  FIRST_DEPOSIT_NO_PLAN: 'Dépôt sans plan',
  IDLE_BALANCE: 'Argent qui dort',
  INACTIVE_14: 'Inactif 2 semaines',
  INACTIVE_30: 'Inactif 1 mois',
  INACTIVE_90: 'Inactif 3 mois',
  HEALTH_DROP: 'Engagement en baisse',
  PLAN_NEAR_MATURITY: 'Plan bientôt terminé',
  EARLY_WITHDRAW_PATTERN: 'Retraits anticipés fréquents',
  HIGH_VALUE: 'Client important'
};

export const ACTION_LABELS = {
  CALL_3MIN: 'Appeler (3 min)',
  WHATSAPP_PERSONAL: 'Écrire sur WhatsApp',
  EMAIL_PROGRESS: 'Envoyer un bilan',
  INVITE_COMMUNITY: 'Inviter à la communauté',
  CHALLENGE_SAVE: 'Proposer un défi épargne',
  ASK_TESTIMONIAL: 'Demander un témoignage',
  UPSELL_SMART: 'Proposer un meilleur plan',
  EDU_VIDEO: 'Envoyer une vidéo d’aide',
  GUIDE_FIRST_DEPOSIT: 'Guider vers le 1er dépôt',
  GUIDE_FIRST_PLAN: 'Guider vers le 1er plan',
  WAKE_SOFT: 'Relancer doucement',
  REACTIVATE_URGENT: 'Réactiver en urgence',
  NONE: 'Aucune action'
};

export const ACTION_OPTIONS = Object.entries(ACTION_LABELS)
  .filter(([value]) => value !== 'NONE')
  .map(([value, label]) => ({ value, label }));

export const TASK_STATUS_LABELS = {
  todo: 'À faire',
  in_progress: 'En cours',
  done: 'Terminé',
  partial: 'Partiel',
  skipped: 'Ignoré',
  blocked: 'Bloqué',
  carried_over: 'Reporté'
};

export const TASK_STATUS_COLORS = {
  todo: 'default',
  in_progress: 'info',
  done: 'success',
  partial: 'warning',
  skipped: 'default',
  blocked: 'error',
  carried_over: 'secondary'
};

export const OUTCOME_LABELS = {
  reached: 'Contacté',
  no_answer: 'Pas de réponse',
  refused: 'A refusé',
  promised: 'A promis de revenir',
  converted: 'A agi (dépôt / plan)',
  other: 'Autre'
};

export const OUTCOME_OPTIONS = Object.entries(OUTCOME_LABELS).map(([value, label]) => ({ value, label }));

export const COHORT_LABELS = {
  new: 'Nouveau',
  legacy_never_deposited: 'Ancien sans dépôt',
  legacy_active: 'Ancien actif',
  legacy_dormant: 'Ancien endormi'
};

export const displayName = (user) => {
  if (!user) return 'Personne';
  const prenom = user.prenom || '';
  const nom = user.nom || '';
  const full = `${prenom} ${nom}`.trim();
  return full || user.phone || 'Personne';
};

export const formatDateFr = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatMoney = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${Math.round(n).toLocaleString('fr-FR')} $`;
};

export const maskPhone = (phone) => {
  if (!phone) return '—';
  const s = String(phone);
  if (s.length <= 4) return s;
  return `${s.slice(0, 3)}•••${s.slice(-2)}`;
};

export const initials = (nameOrUser) => {
  const name = typeof nameOrUser === 'string' ? nameOrUser : displayName(nameOrUser);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0] || '';
  const second = parts.length > 1 ? parts[1][0] || '' : '';
  return `${first}${second}`.toUpperCase();
};

const AVATAR_PALETTE = ['#5C6BC0', '#26A69A', '#EF6C7A', '#F0A030', '#7E57C2', '#42A5A5'];

export const avatarColor = (nameOrUser) => {
  const name = typeof nameOrUser === 'string' ? nameOrUser : displayName(nameOrUser);
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

export const URGENCY_BG = {
  critical: 'error.main',
  high: 'warning.main',
  medium: 'info.main',
  low: 'grey.400'
};

export const digitsOnly = (phone) => String(phone || '').replace(/[^\d+]/g, '');

export const telHref = (phone) => `tel:${digitsOnly(phone)}`;

export const whatsappHref = (phone) => `https://wa.me/${digitsOnly(phone).replace('+', '')}`;
