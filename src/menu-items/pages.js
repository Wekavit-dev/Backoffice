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
      title: 'Modules',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'Topup',
          title: 'Utilisateurs',
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
        },
        {
          id: 'fixed-saves',
          title: 'Plans bloqués',
          type: 'collapse',
          icon: icons.IconKey,
          children : [
            {
              id: 'Investir',
              title: 'Investir',
              type: 'item',
              url: '/wekavit/saves/blocked/invest',
              breadcrumbs: false
            }
          ]
        }
      ]
    }
  ]
};

export default pages;
