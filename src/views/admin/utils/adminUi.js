export const getInitials = (name = '') => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return 'AD';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

export const getAvatarTone = (seed = '') => {
  const tones = [
    'from-violet-500 to-indigo-600',
    'from-sky-500 to-blue-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-pink-600',
    'from-fuchsia-500 to-purple-600'
  ];
  const hash = [...seed].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return tones[hash % tones.length];
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
      'deposits-overview'
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
      'accounting-light'
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
      'addons-overview'
    ]
  }
];
