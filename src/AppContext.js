import React, { createContext, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { clearAdminSession, loadAdminSession, persistAdminSession } from 'utils/adminSession';

const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState(() => loadAdminSession() || {});

  const setSession = useCallback((next) => {
    setGlobalState((prev) => {
      const value = typeof next === 'function' ? next(prev) : next;

      if (!value?.key) {
        clearAdminSession();
        return {};
      }

      return persistAdminSession({ ...prev, ...value });
    });
  }, []);

  const logout = useCallback(() => {
    clearAdminSession();
    setGlobalState({});
  }, []);

  return (
    <AppContext.Provider value={{ globalState, setGlobalState: setSession, logout }}>
      {children}
    </AppContext.Provider>
  );
};

AppProvider.propTypes = {
  children: PropTypes.any
};

export { AppContext, AppProvider };
