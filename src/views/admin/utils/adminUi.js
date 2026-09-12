export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'AD';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const getAvatarBgColor = (seed = '') => {
  const colors = ['#7c3aed', '#2563eb', '#059669', '#d97706', '#e11d48', '#c026d3'];
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export const getMenuCoverage = (admin, totalMenus = 1) => {
  if (admin?.isSuperAdmin) return 100;
  const count = admin?.menuAccess?.length || 0;
  return Math.min(100, Math.round((count / Math.max(totalMenus, 1)) * 100));
};

export const ACCESS_PRESETS = [
  {
    id: 'support',
    label: 'Support client',
    description: 'Accompagnement + consultation utilisateurs',
    menuIds: [
      'default',
      'sss-home',
      'sss-today',
      'sss-overdue',
      'sss-people',
      'users-overview',
      'deposits-overview',
      'admin-transactions-list'
    ]
  },
  {
    id: 'finance',
    label: 'Finance & frais',
    description: 'Statistiques, frais et comptabilité',
    menuIds: [
      'default',
      'fees-dashboard',
      'fees-evolution',
      'fees-top-payers',
      'fees-transactions',
      'fees-by-devise',
      'accounting-light',
      'admin-transactions-list'
    ]
  },
  {
    id: 'growth',
    label: 'Growth',
    description: 'Analyses croissance et performance',
    menuIds: [
      'default',
      'no-deposits-overview',
      'no-saves-plan-overview',
      'best-saver-overview',
      'users-overview',
      'savings-overview'
    ]
  },
  {
    id: 'operations',
    label: 'Opérations',
    description: 'Vue opérationnelle quotidienne',
    menuIds: [
      'default',
      'savings-overview',
      'users-overview',
      'deposits-overview',
      'agents-overview',
      'addons-overview',
      'admin-transactions-list'
    ]
  },
  {
    id: 'challenges',
    label: 'Défis',
    description: 'Gestion et règles des défis d’épargne',
    menuIds: ['default', 'challenges-list', 'challenges-rules']
  }
];
