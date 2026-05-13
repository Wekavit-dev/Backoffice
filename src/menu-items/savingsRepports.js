// assets
import {
  IconKey,
  IconEye,
  IconBrandLastfm,
  IconTrendingUp,
  IconChartBar,
  IconChartLine,
  IconUsers,
  IconReceipt2,
  IconCurrencyDollar,
  IconFileExport
} from '@tabler/icons';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';

// constant
const icons = {
  IconKey,
  IconEye,
  RemoveRedEyeOutlinedIcon,
  IconBrandLastfm,
  IconTrendingUp,
  IconChartBar,
  IconChartLine,
  IconUsers,
  IconReceipt2,
  IconCurrencyDollar,
  IconFileExport
};

// ==============================|| EXTRA PAGES MENU ITEMS ||============================== //

const savingsRepports = {
  id: 'Rapport-Epargnes',
  title: 'Vue globale',
  type: 'group',

  children: [
    {
      id: 'General',
      title: "Vue d'ensemble",
      type: 'collapse',
      icon: icons.IconEye,
      breadcrumbs: false,
      url: null,

      children: [
        {
          id: 'savings-overview',
          title: 'Epargnes',
          type: 'item',
          url: '/wekavit/savings/',
          breadcrumbs: false
        },
        {
          id: 'users-overview',
          title: 'Utilisateurs',
          type: 'item',
          url: '/wekavit/users/',
          breadcrumbs: false
        },
        {
          id: 'deposits-overview',
          title: 'Dépôts',
          type: 'item',
          url: '/wekavit/deposits/',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'administration',
      title: 'Administration',
      type: 'collapse',
      icon: icons.IconBrandLastfm,
      breadcrumbs: false,
      url: null,

      children: [
        {
          id: 'agents-overview',
          title: 'Agents',
          type: 'item',
          url: '/wekavit/agents/',
          breadcrumbs: false
        },
        {
          id: 'admins-overview',
          title: 'Admins',
          type: 'item',
          url: '/wekavit/admins/',
          breadcrumbs: false
        },
        {
          id: 'addons-overview',
          title: 'WekaFund',
          type: 'item',
          url: '/wekavit/addons/',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'Gestion-growth',
      title: 'Gestion growth',
      type: 'collapse',
      icon: icons.IconTrendingUp,
      breadcrumbs: false,
      url: null,

      children: [
        {
          id: 'no-deposits-overview',
          title: 'No Deposits',
          type: 'item',
          url: '/wekavit/noDeposits/',
          breadcrumbs: false
        },
        {
          id: 'no-saves-plan-overview',
          title: 'No Plans',
          type: 'item',
          url: '/wekavit/noSavePlans/',
          breadcrumbs: false
        },
        {
          id: 'best-saver-overview',
          title: 'Best Savers',
          type: 'item',
          url: '/wekavit/bestSavers/',
          breadcrumbs: false
        }
      ]
    },
    {
      id: 'fees-statistics',
      title: 'Statistiques des frais',
      type: 'collapse',
      icon: icons.IconChartBar,
      breadcrumbs: false,
      url: null,

      children: [
        {
          id: 'fees-dashboard',
          title: 'Tableau de bord',
          type: 'item',
          url: '/wekavit/fees/',
          breadcrumbs: false,
          icon: icons.IconChartBar
        },
        {
          id: 'fees-evolution',
          title: 'Analyse temporelle',
          type: 'item',
          url: '/wekavit/fees/evolution',
          breadcrumbs: false,
          icon: icons.IconChartLine
        },
        {
          id: 'fees-top-payers',
          title: 'Top contributeurs',
          type: 'item',
          url: '/wekavit/fees/top-payers',
          breadcrumbs: false,
          icon: icons.IconUsers
        },
        {
          id: 'fees-transactions',
          title: 'Transactions',
          type: 'item',
          url: '/wekavit/fees/transactions',
          breadcrumbs: false,
          icon: icons.IconReceipt2
        },
        {
          id: 'fees-by-devise',
          title: 'Par devise',
          type: 'item',
          url: '/wekavit/fees/by-devise',
          breadcrumbs: false,
          icon: icons.IconCurrencyDollar
        }
      ]
    },
    {
      id: 'accounting-light',
      title: 'Comptabilité light',
      type: 'item',
      url: '/wekavit/accounting/light',
      breadcrumbs: false,
      icon: icons.IconCurrencyDollar
    }
  ]
};

export default savingsRepports;