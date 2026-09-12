import React, { useContext } from 'react';
import { AccountBalanceWallet as WalletIcon } from '@mui/icons-material';
import MainCard from 'ui-component/cards/MainCard';
import { AppContext } from 'AppContext';
import { PageToolbar, SSS_COLORS } from 'views/sss/components/SssLayout';
import UserTransactionsPanel from './components/UserTransactionsPanel';

/**
 * Backoffice — opérations wallet admin (create / verify / history)
 * API base: CHALLENGE_IP
 */
const AdminTransactionsPage = () => {
  const { globalState } = useContext(AppContext);

  return (
    <MainCard contentSX={{ p: { xs: 1.5, sm: 2.5, md: 3 }, bgcolor: SSS_COLORS.pageBg }}>
      <div className="sss-page">
        <PageToolbar
          icon={<WalletIcon />}
          title="Wallet ops"
          subtitle="Recherchez un utilisateur, consultez ses détails, créez un dépôt ou un retrait — l’opération apparaît dans son historique."
          color={SSS_COLORS.brand}
        />
        <section className="sss-surface overflow-hidden p-4 sm:p-5">
          <UserTransactionsPanel token={globalState?.key} showUserColumn />
        </section>
      </div>
    </MainCard>
  );
};

export default AdminTransactionsPage;
