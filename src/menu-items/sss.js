// assets
import { IconHeart, IconClipboardList, IconAlertTriangle, IconUsers, IconSettings } from '@tabler/icons';

const icons = {
  IconHeart,
  IconClipboardList,
  IconAlertTriangle,
  IconUsers,
  IconSettings
};

// ==============================|| ACCOMPAGNEMENT (SSS) MENU ||============================== //

const sssMenu = {
  id: 'accompagnement',
  title: 'Accompagnement',
  type: 'group',
  children: [
    {
      id: 'sss-home',
      title: 'Vue du jour',
      type: 'item',
      url: '/wekavit/sss',
      icon: icons.IconHeart,
      breadcrumbs: false
    },
    {
      id: 'sss-today',
      title: 'À faire aujourd’hui',
      type: 'item',
      url: '/wekavit/sss/today',
      icon: icons.IconClipboardList,
      breadcrumbs: false
    },
    {
      id: 'sss-overdue',
      title: 'En retard',
      type: 'item',
      url: '/wekavit/sss/overdue',
      icon: icons.IconAlertTriangle,
      breadcrumbs: false
    },
    {
      id: 'sss-people',
      title: 'Personnes',
      type: 'item',
      url: '/wekavit/sss/people',
      icon: icons.IconUsers,
      breadcrumbs: false
    },
    {
      id: 'sss-settings',
      title: 'Réglages',
      type: 'item',
      url: '/wekavit/sss/settings',
      icon: icons.IconSettings,
      breadcrumbs: false
    }
  ]
};

export default sssMenu;
