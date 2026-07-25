const SESSION_KEY = 'wekavit_admin_session';

export const loadAdminSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.key ? parsed : null;
  } catch {
    return null;
  }
};

export const persistAdminSession = (session) => {
  if (!session?.key) {
    localStorage.removeItem(SESSION_KEY);
    return session;
  }

  const payload = {
    key: session.key,
    _id: session._id,
    nom: session.nom,
    email: session.email,
    verified: session.verified,
    connected: session.connected,
    isSuperAdmin: Boolean(session.isSuperAdmin),
    menuAccess: Array.isArray(session.menuAccess) ? session.menuAccess : [],
    active: session.active !== false
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  return payload;
};

export const clearAdminSession = () => {
  localStorage.removeItem(SESSION_KEY);
};
