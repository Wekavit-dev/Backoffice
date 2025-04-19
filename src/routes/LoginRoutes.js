// import MinimalLayout from 'layout/MinimalLayout';
import React from 'react';
import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';

// login option 3 routing
const AuthLogin3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Login3')));

const AuthLoginRoute = {
  path: '/',
  element: <AuthLogin3 />,
  children: [
    {
      path: '/pages/authentification3/Login3',
      element: <AuthLogin3 />
    }
  ]
};
export default AuthLoginRoute;
