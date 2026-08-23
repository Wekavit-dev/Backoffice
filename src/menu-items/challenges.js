import { IconTrophy, IconSettings } from '@tabler/icons';

const icons = {
  IconTrophy,
  IconSettings
};

const challengesMenu = {
  id: 'challenges',
  title: "Défis d'épargne",
  type: 'group',
  children: [
    {
      id: 'challenges-list',
      title: 'Tous les défis',
      type: 'item',
      url: '/wekavit/challenges',
      icon: icons.IconTrophy,
      breadcrumbs: false
    },
    {
      id: 'challenges-rules',
      title: 'Comment fonctionnent les défis',
      type: 'item',
      url: '/wekavit/challenges/rules',
      icon: icons.IconSettings,
      breadcrumbs: false
    }
  ]
};

export default challengesMenu;
