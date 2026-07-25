const ROUTE_RULES = [
  { test: /^\/wekavit\/sss\/settings/i, menuId: 'sss-settings' },
  { test: /^\/wekavit\/sss\/people\/[^/]+/i, menuId: 'sss-people' },
  { test: /^\/wekavit\/sss\/people/i, menuId: 'sss-people' },
  { test: /^\/wekavit\/sss\/overdue/i, menuId: 'sss-overdue' },
  { test: /^\/wekavit\/sss\/today/i, menuId: 'sss-today' },
  { test: /^\/wekavit\/sss\/?$/i, menuId: 'sss-home' },
  { test: /^\/wekavit\/dashboard\/default/i, menuId: 'default' },
  { test: /^\/wekavit\/savings/i, menuId: 'savings-overview' },
  { test: /^\/wekavit\/users/i, menuId: 'users-overview' },
  { test: /^\/wekavit\/deposits/i, menuId: 'deposits-overview' },
  { test: /^\/wekavit\/agents/i, menuId: 'agents-overview' },
  { test: /^\/wekavit\/admins/i, menuId: 'admins-overview' },
  { test: /^\/wekavit\/addons/i, menuId: 'addons-overview' },
  { test: /^\/wekavit\/nodeposits/i, menuId: 'no-deposits-overview' },
  { test: /^\/wekavit\/nosaveplans/i, menuId: 'no-saves-plan-overview' },
  { test: /^\/wekavit\/bestsavers/i, menuId: 'best-saver-overview' },
  { test: /^\/wekavit\/fees\/evolution/i, menuId: 'fees-evolution' },
  { test: /^\/wekavit\/fees\/top-payers/i, menuId: 'fees-top-payers' },
  { test: /^\/wekavit\/fees\/transactions/i, menuId: 'fees-transactions' },
  { test: /^\/wekavit\/fees\/by-devise/i, menuId: 'fees-by-devise' },
  { test: /^\/wekavit\/fees/i, menuId: 'fees-dashboard' },
  { test: /^\/wekavit\/accounting\/light/i, menuId: 'accounting-light' },
  { test: /^\/wekavit\/funds\/entries/i, menuId: 'funds-entries-overview' },
  { test: /^\/wekavit\/funds\/loans/i, menuId: 'funds-loans-overview' },
  { test: /^\/wekavit\/funds\/expenses/i, menuId: 'funds-expenses-overview' },
  { test: /^\/wekavit\/funds\/dash/i, menuId: 'funds-entries-overview' },
  { test: /^\/wekavit\/topup/i, menuId: 'Blocked' },
  { test: /^\/wekavit\/withdraw/i, menuId: 'deposits-overview' }
];

export const resolveMenuIdFromPath = (pathname = '') => {
  const normalized = pathname.split('?')[0];
  const rule = ROUTE_RULES.find((item) => item.test.test(normalized));
  return rule?.menuId || null;
};

export const hasAccessToPath = (pathname, menuAccess = [], isSuperAdmin = false) => {
  if (isSuperAdmin) return true;

  const menuId = resolveMenuIdFromPath(pathname);
  if (!menuId) return true;

  return (menuAccess || []).includes(menuId);
};
