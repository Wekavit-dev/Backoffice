import { useContext, useMemo } from 'react';
import { Typography } from '@mui/material';
import { AppContext } from 'AppContext';
import NavGroup from './NavGroup';
import menuItem from 'menu-items';
import { filterMenuByAccess } from 'utils/menuFilter';

const MenuList = () => {
  const { globalState } = useContext(AppContext);

  const filteredMenu = useMemo(
    () => filterMenuByAccess(menuItem, globalState?.menuAccess, globalState?.isSuperAdmin),
    [globalState?.menuAccess, globalState?.isSuperAdmin]
  );

  const navItems = filteredMenu.items.map((item) => {
    switch (item.type) {
      case 'group':
        return <NavGroup key={item.id} item={item} />;
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  if (!navItems.length) {
    return (
      <div className="rounded-xl border border-dashed border-sss-border bg-sss-brand-soft/40 px-4 py-6 text-center">
        <p className="text-sm font-semibold text-sss-text">Aucun menu assigné</p>
        <p className="mt-1 text-xs text-sss-muted">Demandez à un super-admin de configurer vos accès.</p>
      </div>
    );
  }

  return <>{navItems}</>;
};

export default MenuList;
