// assets
import { IconKey } from '@tabler/icons';

// constant
const icons = {
  IconKey
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const pages = {
  id: 'pages',
  title: 'Traitement',
  type: 'group',
  children: [
    {
      id: 'authentication',
      title: 'Transactions',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'Topup',
          title: 'Dépôt',
          type: 'item',
          url: '/topup/',
          breadcrumbs: false
        },
        {
          id: 'withdraw',
          title: 'Retrait',
          type: 'item',
          url: '/wekavit/withdraw/withdraw',
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default pages;
