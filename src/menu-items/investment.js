// assets
import { IconDashboard } from '@tabler/icons';
import MoneyIcon from '@mui/icons-material/Money';

// constant
const icons = { IconDashboard, MoneyIcon };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const investment = {
  id: 'funds',
  title: 'Investissements',
  type: 'group',
  children: [
    {
      id: 'funds-overview',
      title: "Fonds d'investissement",
      type: 'collapse',
      icon: icons.MoneyIcon,
      breadcrumbs: false,
      url: null,

      children: [
        // {
        //   id: 'savings-overview',
        //   title: 'Statistiques',
        //   type: 'item',
        //   url: '/wekavit/funds/dash',
        //   breadcrumbs: false
        // },
        {
          id: 'funds-entries-overview',
          title: 'Entrées',
          type: 'item',
          url: '/wekavit/funds/entries',
          breadcrumbs: false
        },
        {
          id: 'funds-loans-overview',
          title: 'Prêts',
          type: 'item',
          url: '/wekavit/funds/loans',
          breadcrumbs: false
        },
        {
          id: 'funds-expenses-overview',
          title: 'Dépenses',
          type: 'item',
          url: '/wekavit/funds/expenses',
          breadcrumbs: false
        }
      ]
    },
    
  ]
};

export default investment;
