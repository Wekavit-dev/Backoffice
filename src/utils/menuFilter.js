import menuItems from 'menu-items';

const filterNode = (node, allowed) => {
  if (node.type === 'item') {
    return allowed.has(node.id) ? node : null;
  }

  if (node.children?.length) {
    const children = node.children.map((child) => filterNode(child, allowed)).filter(Boolean);
    if (!children.length) return null;
    return { ...node, children };
  }

  return null;
};

export const filterMenuByAccess = (menus, menuAccess = [], isSuperAdmin = false) => {
  if (isSuperAdmin) {
    return menus;
  }

  const allowed = new Set(menuAccess || []);

  return {
    ...menus,
    items: (menus.items || [])
      .map((group) => {
        const children = group.children?.map((child) => filterNode(child, allowed)).filter(Boolean);
        if (!children?.length) return null;
        return { ...group, children };
      })
      .filter(Boolean)
  };
};

const collectMenuUrls = (nodes = [], acc = []) => {
  nodes.forEach((node) => {
    if (node.type === 'item' && node.url) {
      acc.push({ id: node.id, url: node.url });
    }
    if (node.children?.length) {
      collectMenuUrls(node.children, acc);
    }
  });
  return acc;
};

export const getFirstAccessiblePath = (menuAccess = [], isSuperAdmin = false) => {
  const filtered = filterMenuByAccess(menuItems, menuAccess, isSuperAdmin);
  const urls = collectMenuUrls(filtered.items);
  return urls[0]?.url || '/wekavit/Dashboard/Default';
};

export const hasMenuAccess = (menuId, menuAccess = [], isSuperAdmin = false) => {
  if (isSuperAdmin) return true;
  if (!menuId) return true;
  return (menuAccess || []).includes(menuId);
};
