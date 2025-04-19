import React, { createContext, useState } from 'react';
import PropTyes from 'prop-types';

// Create a new context
const AppContext = createContext();

// Create a provider component to provide the global state to the entire app
const AppProvider = ({ children }) => {
  const [globalState, setGlobalState] = useState('initial value');

  return <AppContext.Provider value={{ globalState, setGlobalState }}>{children}</AppContext.Provider>;
};
AppProvider.propTypes = {
  children: PropTyes.any
};
export { AppContext, AppProvider };
