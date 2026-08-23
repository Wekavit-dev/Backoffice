export const GAME_MODES = [
  {
    value: 'fixed_schedule',
    label: 'Versements réguliers',
    description: 'Les participants doivent verser un montant fixe à dates prévues',
    requiresContributionAmount: true,
    requiresContributionFrequency: true
  },
  {
    value: 'free_goal',
    label: 'Objectif libre',
    description: 'Chacun avance à son rythme jusqu’à atteindre l’objectif',
    requiresContributionAmount: false,
    requiresContributionFrequency: false
  },
  {
    value: 'flexible_amount',
    label: 'Montants libres',
    description: 'Verser quand on veut, le montant que l’on veut',
    requiresContributionAmount: false,
    requiresContributionFrequency: false
  },
  {
    value: 'first_to_goal',
    label: 'Course à l’objectif',
    description: 'Le premier qui atteint l’objectif gagne un gros bonus',
    requiresContributionAmount: false,
    requiresContributionFrequency: false
  },
  {
    value: 'streak_race',
    label: 'Plus longue série',
    description: 'Récompense ceux qui versent régulièrement sans interruption',
    requiresContributionAmount: false,
    requiresContributionFrequency: false
  },
  {
    value: 'accumulation_sprint',
    label: 'Qui épargne le plus vite',
    description: 'Bonus pour la vitesse d’épargne',
    requiresContributionAmount: false,
    requiresContributionFrequency: false
  }
];

export const FREQUENCIES = [
  { value: 'daily', label: 'Chaque jour' },
  { value: 'weekly', label: 'Chaque semaine' },
  { value: 'biweekly', label: 'Toutes les 2 semaines' },
  { value: 'monthly', label: 'Chaque mois' }
];

export const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les états' },
  { value: 'draft', label: 'Brouillon' },
  { value: 'active', label: 'En cours' },
  { value: 'completed', label: 'Terminé' },
  { value: 'cancelled', label: 'Annulé' }
];

export const PUBLISH_OPTIONS = [
  { value: 'all', label: 'Visibilité : tous' },
  { value: 'true', label: 'Visibles dans l’app' },
  { value: 'false', label: 'Masqués (brouillon)' }
];

export const STATUS_COLORS = {
  draft: 'default',
  active: 'success',
  completed: 'info',
  cancelled: 'error'
};

export const STATUS_LABELS = {
  draft: 'Brouillon',
  active: 'En cours',
  completed: 'Terminé',
  cancelled: 'Annulé'
};

export const MEMBER_STATUS_LABELS = {
  active: 'Actif',
  completed: 'Objectif atteint',
  left: 'A quitté',
  disqualified: 'Exclu'
};

export const MEMBER_STATUS_COLORS = {
  active: 'success',
  completed: 'info',
  left: 'default',
  disqualified: 'error'
};

export const DISQUALIFICATION_LABELS = {
  max_missed_periods: 'Trop de versements manqués',
  max_late_contributions: 'Trop de versements en retard',
  min_participation_rate: 'Participation insuffisante',
  min_contributions_required: 'Pas assez de versements',
  admin_manual: 'Exclusion manuelle'
};

export const PRIZE_TYPE_LABELS = {
  custom: 'Autre',
  cash: 'Argent',
  badge: 'Badge',
  voucher: 'Bon / coupon'
};

export const RULE_CATEGORY_LABELS = {
  scoring: 'Points & classement',
  impayes: 'Versements manqués',
  disqualification: 'Exclusion',
  gameplay: 'Déroulement du défi'
};

export const VALUE_TYPE_LABELS = {
  number: 'Nombre',
  boolean: 'Oui / Non',
  percent: 'Pourcentage'
};

export const formatRuleValue = (rule) => {
  if (!rule) return '—';
  const value = rule.value ?? rule.defaultValue;
  if (rule.valueType === 'boolean') return Number(value) ? 'Oui' : 'Non';
  if (rule.valueType === 'percent') return `${value} %`;
  return String(value ?? '—');
};

export const formatRuleBounds = (rule) => {
  if (!rule) return '—';
  const min = rule.min != null ? rule.min : '—';
  const max = rule.max != null ? rule.max : 'illimité';
  return `${min} → ${max}`;
};

export const getGameModeLabel = (value) => GAME_MODES.find((m) => m.value === value)?.label || value || '—';

export const getGameModeMeta = (value) => GAME_MODES.find((m) => m.value === value) || GAME_MODES[0];

export const getMemberDisplayName = (user) => {
  if (!user) return 'Participant inconnu';
  const full = `${user.prenom || ''} ${user.nom || ''}`.trim();
  return full || user.email || 'Participant';
};

export const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const formatDateInput = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
};

export const formatAmount = (amount, devise) => {
  const n = Number(amount) || 0;
  const unit = devise?.unite || devise?.nom || '';
  return `${n.toLocaleString('fr-FR')}${unit ? ` ${unit}` : ''}`;
};

export const extractList = (response) => {
  const payload = response?.data?.data ?? response?.data ?? [];
  return Array.isArray(payload) ? payload : [];
};

export const extractData = (response) => response?.data?.data ?? response?.data ?? null;

export const isApiSuccess = (response) => {
  const status = response?.status ?? response?.data?.status;
  return status === 200 || status === 201;
};
