// assets
import { IconKey } from '@tabler/icons';

// constant
const icons = {
  IconKey
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const repports = {
  id: 'Epargnes',
  title: 'Rapports',
  type: 'group',

  children: [
    {
      id: 'Blocked',
      title: 'Epargnes',
      type: 'item',
      url: '/topup/',
      icon: icons.IconKey,
      breadcrumbs: false
    }
  ]
};

export default repports;
