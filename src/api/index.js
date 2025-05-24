import AuthentificationApi from './auth/auth';
import DepositsApi from './deposits/deposit';
import WithdrawApi from './withdraw/withdraw';
import HistoryApi from './history/history';

// importing users API
import UsersApi from './users/users';

export const AuthentificationAPI = AuthentificationApi;
export const DepositsAPI = DepositsApi;
export const WithdrawAPI = WithdrawApi;
export const HistoryAPI = HistoryApi;

// exporting users API
export const UsersAPI = UsersApi;
