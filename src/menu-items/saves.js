// assets
import { IconKey } from '@tabler/icons';

// constant
const icons = {
  IconKey
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const saves = {
  id: 'Epargnes',
  title: 'Epargnes',
  type: 'group',
  children: [
    {
      id: 'Blocked',
      title: 'Bloqués',
      type: 'collapse',
      icon: icons.IconKey,
      children: [
        {
          id: 'Investir',
          title: 'Investir',
          type: 'item',
          url: '/topup/',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default saves;
