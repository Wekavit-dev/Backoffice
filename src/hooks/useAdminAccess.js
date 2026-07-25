import { useContext, useMemo } from 'react';
import { AppContext } from 'AppContext';
import { hasAccessToPath } from 'config/routePermissions';
import { hasMenuAccess, getFirstAccessiblePath } from 'utils/menuFilter';

export const useAdminAccess = () => {
  const { globalState } = useContext(AppContext);

  const menuAccess = globalState?.menuAccess || [];
  const isSuperAdmin = Boolean(globalState?.isSuperAdmin);

  return useMemo(
    () => ({
      menuAccess,
      isSuperAdmin,
      isAuthenticated: Boolean(globalState?.key),
      hasMenu: (menuId) => hasMenuAccess(menuId, menuAccess, isSuperAdmin),
      hasAccessToPath: (pathname) => hasAccessToPath(pathname, menuAccess, isSuperAdmin),
      defaultPath: getFirstAccessiblePath(menuAccess, isSuperAdmin)
    }),
    [globalState?.key, menuAccess, isSuperAdmin]
  );
};
