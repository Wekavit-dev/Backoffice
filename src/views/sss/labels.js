// ============================================
// Libellés français simples pour le module Accompagnement (SSS)
// Version améliorée avec typage, fonctions utilitaires et thèmes
// ============================================

// ============================================
// 1. CONFIGURATION ET THÈMES
// ============================================

export const THEME_CONFIG = {
  colors: {
    primary: '#5C6BC0',
    secondary: '#26A69A',
    error: '#EF6C7A',
    warning: '#F0A030',
    info: '#42A5A5',
    success: '#66BB6A'
  },
  gradients: {
    success: 'linear-gradient(135deg, #66BB6A, #26A69A)',
    warning: 'linear-gradient(135deg, #F0A030, #FF6F00)',
    error: 'linear-gradient(135deg, #EF6C7A, #C62828)',
    info: 'linear-gradient(135deg, #42A5A5, #1A237E)',
    primary: 'linear-gradient(135deg, #5C6BC0, #7E57C2)'
  }
};

// ============================================
// 2. LIBELLÉS PRINCIPAUX (STAGES)
// ============================================

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

// Fonction pour obtenir l'icône de l'étape (nouvelle exportation)
export const getStageIcon = (stage) => {
  const icons = {
    S0: '🌟',
    S1: '🆕',
    S2: '✅',
    S3: '💤',
    S4: '💰',
    S5: '📋',
    S6: '💳',
    S7: '📈',
    S8: '🏆',
    S9: '⭐',
    S10: '🤝',
    S11: '⏸️',
    S12: '⏰',
    S13: '📅'
  };
  return icons[stage] || '📌';
};

// Fonction pour obtenir la couleur de l'étape (nouvelle exportation)
export const getStageColor = (stage) => {
  const colors = {
    S0: 'default',
    S1: 'info',
    S2: 'success',
    S3: 'warning',
    S4: 'success',
    S5: 'info',
    S6: 'primary',
    S7: 'success',
    S8: 'success',
    S9: 'success',
    S10: 'success',
    S11: 'warning',
    S12: 'warning',
    S13: 'error'
  };
  return colors[stage] || 'default';
};

// ============================================
// 3. URGENCE
// ============================================

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

// Nouveaux exports pour l'urgence
export const URGENCY_GRADIENTS = {
  critical: 'linear-gradient(135deg, #EF6C7A, #C62828)',
  high: 'linear-gradient(135deg, #F0A030, #FF6F00)',
  medium: 'linear-gradient(135deg, #42A5A5, #0D47A1)',
  low: 'linear-gradient(135deg, #9E9E9E, #616161)'
};

export const URGENCY_ICONS = {
  critical: '🔴',
  high: '🟠',
  medium: '🔵',
  low: '🟢'
};

export const URGENCY_EMOJIS = {
  critical: '🚨',
  high: '⚠️',
  medium: 'ℹ️',
  low: '✅'
};

export const URGENCY_BG = {
  critical: 'error.main',
  high: 'warning.main',
  medium: 'info.main',
  low: 'grey.400'
};

export const URGENCY_BG_LIGHT = {
  critical: 'error.light',
  high: 'warning.light',
  medium: 'info.light',
  low: 'grey.200'
};

// ============================================
// 4. SANTÉ
// ============================================

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

export const HEALTH_ICONS = {
  excellent: '💪',
  good: '👍',
  watch: '👀',
  critical: '⚠️'
};

export const HEALTH_SCORES = {
  excellent: { min: 80, max: 100 },
  good: { min: 60, max: 79 },
  watch: { min: 40, max: 59 },
  critical: { min: 0, max: 39 }
};

// ============================================
// 5. ALERTES
// ============================================

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
  HIGH_VALUE: 'Client important',
  NO_RECENT_ACTIVITY: 'Pas d\'activité récente',
  LOW_ENGAGEMENT: 'Engagement faible',
  PENDING_ACTION: 'Action en attente',
  URGENT_CALL: 'Appel urgent recommandé'
};

export const ALERT_COLORS = {
  NEVER_DEPOSITED: 'warning',
  PENDING_DEPOSIT_STUCK: 'error',
  FIRST_DEPOSIT_NO_PLAN: 'info',
  IDLE_BALANCE: 'warning',
  INACTIVE_14: 'warning',
  INACTIVE_30: 'error',
  INACTIVE_90: 'error',
  HEALTH_DROP: 'warning',
  PLAN_NEAR_MATURITY: 'info',
  EARLY_WITHDRAW_PATTERN: 'error',
  HIGH_VALUE: 'success',
  NO_RECENT_ACTIVITY: 'warning',
  LOW_ENGAGEMENT: 'warning',
  PENDING_ACTION: 'info',
  URGENT_CALL: 'error'
};

export const ALERT_ICONS = {
  NEVER_DEPOSITED: '💸',
  PENDING_DEPOSIT_STUCK: '⏳',
  FIRST_DEPOSIT_NO_PLAN: '📝',
  IDLE_BALANCE: '💤',
  INACTIVE_14: '📆',
  INACTIVE_30: '📅',
  INACTIVE_90: '🗓️',
  HEALTH_DROP: '📉',
  PLAN_NEAR_MATURITY: '🎯',
  EARLY_WITHDRAW_PATTERN: '🔁',
  HIGH_VALUE: '💎',
  NO_RECENT_ACTIVITY: '🌙',
  LOW_ENGAGEMENT: '📊',
  PENDING_ACTION: '⏰',
  URGENT_CALL: '📞'
};

// ============================================
// 6. ACTIONS
// ============================================

export const ACTION_LABELS = {
  CALL_3MIN: 'Appeler (3 min)',
  WHATSAPP_PERSONAL: 'Écrire sur WhatsApp',
  EMAIL_PROGRESS: 'Envoyer un bilan',
  INVITE_COMMUNITY: 'Inviter à la communauté',
  CHALLENGE_SAVE: 'Proposer un défi épargne',
  ASK_TESTIMONIAL: 'Demander un témoignage',
  UPSELL_SMART: 'Proposer un meilleur plan',
  EDU_VIDEO: 'Envoyer une vidéo d\'aide',
  GUIDE_FIRST_DEPOSIT: 'Guider vers le 1er dépôt',
  GUIDE_FIRST_PLAN: 'Guider vers le 1er plan',
  WAKE_SOFT: 'Relancer doucement',
  REACTIVATE_URGENT: 'Réactiver en urgence',
  NONE: 'Aucune action'
};

export const ACTION_ICONS = {
  CALL_3MIN: '📞',
  WHATSAPP_PERSONAL: '💬',
  EMAIL_PROGRESS: '📧',
  INVITE_COMMUNITY: '👥',
  CHALLENGE_SAVE: '🏆',
  ASK_TESTIMONIAL: '📝',
  UPSELL_SMART: '📈',
  EDU_VIDEO: '🎥',
  GUIDE_FIRST_DEPOSIT: '💳',
  GUIDE_FIRST_PLAN: '📋',
  WAKE_SOFT: '🌅',
  REACTIVATE_URGENT: '🚀',
  NONE: '➖'
};

export const ACTION_COLORS = {
  CALL_3MIN: 'primary',
  WHATSAPP_PERSONAL: 'success',
  EMAIL_PROGRESS: 'info',
  INVITE_COMMUNITY: 'secondary',
  CHALLENGE_SAVE: 'warning',
  ASK_TESTIMONIAL: 'info',
  UPSELL_SMART: 'primary',
  EDU_VIDEO: 'info',
  GUIDE_FIRST_DEPOSIT: 'success',
  GUIDE_FIRST_PLAN: 'success',
  WAKE_SOFT: 'warning',
  REACTIVATE_URGENT: 'error',
  NONE: 'default'
};

export const ACTION_OPTIONS = Object.entries(ACTION_LABELS)
  .filter(([value]) => value !== 'NONE')
  .map(([value, label]) => ({ value, label }));

// ============================================
// 7. STATUTS DES TÂCHES
// ============================================

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

export const TASK_STATUS_ICONS = {
  todo: '⭕',
  in_progress: '🔄',
  done: '✅',
  partial: '🔶',
  skipped: '⏭️',
  blocked: '🚫',
  carried_over: '⏩'
};

export const TASK_STATUS_ORDER = {
  todo: 0,
  in_progress: 1,
  partial: 2,
  blocked: 3,
  done: 4,
  skipped: 5,
  carried_over: 6
};

// ============================================
// 8. RÉSULTATS
// ============================================

export const OUTCOME_LABELS = {
  reached: 'Contacté',
  no_answer: 'Pas de réponse',
  refused: 'A refusé',
  promised: 'A promis de revenir',
  converted: 'A agi (dépôt / plan)',
  other: 'Autre'
};

export const OUTCOME_ICONS = {
  reached: '✅',
  no_answer: '📵',
  refused: '❌',
  promised: '🤝',
  converted: '🎯',
  other: '📝'
};

export const OUTCOME_COLORS = {
  reached: 'success',
  no_answer: 'warning',
  refused: 'error',
  promised: 'info',
  converted: 'success',
  other: 'default'
};

export const OUTCOME_OPTIONS = Object.entries(OUTCOME_LABELS).map(([value, label]) => ({ value, label }));

// ============================================
// 9. COHORTES
// ============================================

export const COHORT_LABELS = {
  new: 'Nouveau',
  legacy_never_deposited: 'Ancien sans dépôt',
  legacy_active: 'Ancien actif',
  legacy_dormant: 'Ancien endormi'
};

export const COHORT_COLORS = {
  new: 'success',
  legacy_never_deposited: 'warning',
  legacy_active: 'info',
  legacy_dormant: 'default'
};

export const COHORT_ICONS = {
  new: '🆕',
  legacy_never_deposited: '💤',
  legacy_active: '📈',
  legacy_dormant: '🌙'
};

// ============================================
// 10. FONCTIONS UTILITAIRES (exportées individuellement)
// ============================================

/**
 * Obtient le nom complet d'un utilisateur
 */
export const displayName = (user) => {
  if (!user) return 'Personne';
  const prenom = user.prenom || '';
  const nom = user.nom || '';
  const full = `${prenom} ${nom}`.trim();
  return full || user.phone || user.email || 'Personne';
};

/**
 * Formate une date en français
 */
export const formatDateFr = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate une date courte
 */
export const formatDateShort = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Formate un montant en dollars
 */
export const formatMoney = (value, currency = '$') => {
  if (value === null || value === undefined || value === '') return '—';
  const n = Number(value);
  if (!Number.isFinite(n)) return '—';
  return `${Math.round(n).toLocaleString('fr-FR')} ${currency}`;
};

/**
 * Formate un montant en FCFA
 */
export const formatMoneyCFA = (value) => {
  return formatMoney(value, 'F CFA');
};

/**
 * Masque un numéro de téléphone
 */
export const maskPhone = (phone) => {
  if (!phone) return '—';
  const s = String(phone);
  if (s.length <= 4) return s;
  const visible = Math.min(3, Math.floor(s.length / 3));
  const hidden = s.length - visible - 2;
  return `${s.slice(0, visible)}${'•'.repeat(hidden)}${s.slice(-2)}`;
};

/**
 * Obtient les initiales d'un nom
 */
export const initials = (nameOrUser) => {
  const name = typeof nameOrUser === 'string' ? nameOrUser : displayName(nameOrUser);
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const first = parts[0][0] || '';
  const second = parts.length > 1 ? parts[1][0] || '' : '';
  return `${first}${second}`.toUpperCase();
};

// Palette de couleurs pour les avatars
const AVATAR_PALETTE = [
  '#5C6BC0', '#26A69A', '#EF6C7A', '#F0A030',
  '#7E57C2', '#42A5A5', '#66BB6A', '#EF5350',
  '#FFA726', '#AB47BC', '#26C6DA', '#8D6E63'
];

/**
 * Obtient une couleur d'avatar basée sur le nom
 */
export const avatarColor = (nameOrUser) => {
  const name = typeof nameOrUser === 'string' ? nameOrUser : displayName(nameOrUser);
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) % AVATAR_PALETTE.length;
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

/**
 * Obtient une couleur d'état pour un avatar
 */
export const getStatusColor = (status) => {
  const colors = {
    online: '#4CAF50',
    away: '#FF9800',
    busy: '#F44336',
    offline: '#9E9E9E'
  };
  return colors[status] || colors.offline;
};

/**
 * Nettoie un numéro de téléphone
 */
export const digitsOnly = (phone) => String(phone || '').replace(/[^\d+]/g, '');

/**
 * Génère un lien tel
 */
export const telHref = (phone) => `tel:${digitsOnly(phone)}`;

/**
 * Génère un lien WhatsApp
 */
export const whatsappHref = (phone) => `https://wa.me/${digitsOnly(phone).replace('+', '')}`;

/**
 * Génère un lien mailto
 */
export const mailtoHref = (email, subject = '') => {
  const base = `mailto:${email}`;
  return subject ? `${base}?subject=${encodeURIComponent(subject)}` : base;
};

// ============================================
// 11. FONCTIONS DE CLASSIFICATION (nouveaux exports)
// ============================================

/**
 * Obtient le niveau de santé à partir d'un score
 */
export const getHealthLevelFromScore = (score) => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'watch';
  return 'critical';
};

/**
 * Obtient le libellé d'urgence à partir de la valeur
 */
export const getUrgencyLabel = (urgency) => {
  return URGENCY_LABELS[urgency] || urgency || 'Inconnu';
};

/**
 * Obtient le libellé d'étape à partir de la valeur
 */
export const getStageLabel = (stage) => {
  return STAGE_LABELS[stage] || stage || 'Inconnu';
};

/**
 * Vérifie si une tâche est urgente
 */
export const isUrgent = (task) => {
  return task?.urgency === 'critical' || task?.urgency === 'high';
};

/**
 * Vérifie si une tâche est en retard
 */
export const isOverdue = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

// ============================================
// 12. EXPORT PAR DÉFAUT (conservé pour compatibilité)
// ============================================

export default {
  // Stages
  STAGE_LABELS,
  STAGE_OPTIONS,
  getStageIcon,
  getStageColor,

  // Urgence
  URGENCY_LABELS,
  URGENCY_COLORS,
  URGENCY_GRADIENTS,
  URGENCY_ICONS,
  URGENCY_EMOJIS,
  URGENCY_BG,
  URGENCY_BG_LIGHT,

  // Santé
  HEALTH_LABELS,
  HEALTH_COLORS,
  HEALTH_ICONS,
  HEALTH_SCORES,

  // Alertes
  ALERT_LABELS,
  ALERT_COLORS,
  ALERT_ICONS,

  // Actions
  ACTION_LABELS,
  ACTION_ICONS,
  ACTION_COLORS,
  ACTION_OPTIONS,

  // Statuts des tâches
  TASK_STATUS_LABELS,
  TASK_STATUS_COLORS,
  TASK_STATUS_ICONS,
  TASK_STATUS_ORDER,

  // Résultats
  OUTCOME_LABELS,
  OUTCOME_ICONS,
  OUTCOME_COLORS,
  OUTCOME_OPTIONS,

  // Cohortes
  COHORT_LABELS,
  COHORT_COLORS,
  COHORT_ICONS,

  // Fonctions utilitaires
  displayName,
  formatDateFr,
  formatDateShort,
  formatMoney,
  formatMoneyCFA,
  maskPhone,
  initials,
  avatarColor,
  getStatusColor,
  digitsOnly,
  telHref,
  whatsappHref,
  mailtoHref,

  // Fonctions de classification
  getHealthLevelFromScore,
  getUrgencyLabel,
  getStageLabel,
  isUrgent,
  isOverdue
};