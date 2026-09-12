import { IconWallet } from '@tabler/icons';

const icons = {
  IconWallet
};

const adminTransactionsMenu = {
  id: 'admin-transactions',
  title: 'Wallet ops',
  type: 'group',
  children: [
    {
      id: 'admin-transactions-list',
      title: 'Transactions wallet',
      type: 'item',
      url: '/wekavit/admin-transactions',
      icon: icons.IconWallet,
      breadcrumbs: false
    }
  ]
};

export default adminTransactionsMenu;
