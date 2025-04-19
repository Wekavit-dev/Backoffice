// import { lazy } from 'react';

// // project imports
// import Loadable from 'ui-component/Loadable';
// import MainLayout from 'layout/MainLayout';

// // login option 3 routing
// const AuthLogin3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Login3')));
// // const AuthRegister3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Register3')));
// const TopupTrans = Loadable(lazy(() => import('views/topup')));

// // ==============================|| AUTHENTICATION ROUTING ||============================== //

// const AuthenticationRoutes = {
//   path: '/',
//   element: <MainLayout />,
//   children: [
//     {
//       path: '/topup',
//       element: <TopupTrans />
//     },
//     {
//       path: '/',
//       element: <AuthLogin3 />
//     }
//   ]
// };

// export default AuthenticationRoutes;

import React from 'react';
import { lazy } from 'react';
import Loadable from 'ui-component/Loadable';
import MainLayout from 'layout/MainLayout';

const TopupTrans = Loadable(lazy(() => import('views/topup')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/topup',
  element: <MainLayout />,
  children: [
    {
      path: '/topup',
      element: <TopupTrans />
    }
  ]
};

// Separate route for AuthLogin3 without MainLayout

export { AuthenticationRoutes };
