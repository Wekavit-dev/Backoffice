// assets
import { IconKey, IconEye, IconBrandLastfm, IconTrendingUp } from '@tabler/icons';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';

// constant
const icons = {
  IconKey,
  IconEye,
  RemoveRedEyeOutlinedIcon,
  IconBrandLastfm,
  IconTrendingUp
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
        }
      ]
    }
  ]
};

export default savingsRepports;
