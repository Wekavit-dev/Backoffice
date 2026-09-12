import dashboard from './dashboard';
import repports from './repports';
import savingsRepports from './savingsRepports';
import investment from './investment';
import sssMenu from './sss';
import challengesMenu from './challenges';
import adminTransactionsMenu from './adminTransactions';
// import other from './other';
// import utilities from './utilities';
// import config from './configuration';
// import other from './other';

// ==============================|| MENU ITEMS ||============================== //

const menuItems = {
  items: [dashboard, sssMenu, challengesMenu, adminTransactionsMenu, savingsRepports, repports, investment]
};

export default menuItems;
