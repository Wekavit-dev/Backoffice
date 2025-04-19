// assets
import { IconTypography, IconPalette, IconShadow, IconWindmill } from '@tabler/icons';

// constant
const icons = {
  IconTypography,
  IconPalette,
  IconShadow,
  IconWindmill
};

// ==============================|| UTILITIES MENU ITEMS ||============================== //

const utilities = {
  id: 'login',
  title: 'Reconnexion',
  type: 'group',
  children: [
    {
      id: 'default',
      title: 'Login',
      type: 'item',
      url: '/pages/authentification3/Login3',
      icon: icons.IconDashboard,
      breadcrumbs: false
    }
  ]
};

export default utilities;
