// assets
import { IconTypography, IconPalette, IconShadow, IconWindmill } from '@tabler/icons';

// constant
const icons = {
  IconTypography,
  IconPalette,
  IconShadow,
  IconFileSettings,
  IconWindmill
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const config = {
  id: 'config',
  title: 'Config gernérale.',
  type: 'group',

  children: [
    {
      id: 'authentication',
      title: 'Configuration',
      type: 'collapse',
      icon: icons.IconTypography,

      children: [
        {
          id: 'default',
          title: 'Les interets',
          type: 'item',
          url: '/wekavit/config/Interest',
          icon: icons.IconDashboard,
          breadcrumbs: false
        },
        {
          id: 'country',
          title: 'Les pays',
          type: 'item',
          url: '/wekavit/config/Country',
          icon: icons.IconDashboard,
          breadcrumbs: false
        },
        {
          id: 'numbers',
          title: 'Les numéros',
          type: 'item',
          url: '/wekavit/config/Number',
          icon: icons.IconDashboard,
          breadcrumbs: false
        }
      ]
    }
  ]
};

export default config;
