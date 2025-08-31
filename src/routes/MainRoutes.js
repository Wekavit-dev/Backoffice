import { lazy } from 'react';
// import { useState } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const TransTopup = Loadable(lazy(() => import('views/topup')));
const Savings = Loadable(lazy(() => import('views/saves')));
const Deposits = Loadable(lazy(() => import('views/deposits')));
const Users = Loadable(lazy(() => import('views/users')));
const Agents = Loadable(lazy(() => import('views/agents')));
const Admin = Loadable(lazy(() => import('views/admin')));
const AddOns = Loadable(lazy(() => import('views/addOn')));
const TransWithdraw = Loadable(lazy(() => import('views/withdraw')));
const NoDeposits = Loadable(lazy(() => import('views/growth/noDepositUsers')));
const NoPlans = Loadable(lazy(() => import('views/growth/noPlans')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));
const UtilsMaterialIcons = Loadable(lazy(() => import('views/utilities/MaterialIcons')));
const UtilsTablerIcons = Loadable(lazy(() => import('views/utilities/TablerIcons')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

//the userData

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/wekavit',
  element: <MainLayout />,
  children: [
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'savings',
      element: <Savings />
    },
    {
      path: 'deposits',
      element: <Deposits />
    },
    {
      path: 'users',
      element: <Users />
    },
    {
      path: 'agents',
      element: <Agents />
    },
    {
      path: 'admins',
      element: <Admin />
    },
    {
      path: 'addons',
      element: <AddOns />
    },
    {
      path: 'noDeposits',
      element: <NoDeposits />
    },
    {
      path: 'noSavePlans',
      element: <NoPlans />
    },
    {
      path: 'topup',
      children: [
        {
          path: 'trans',
          element: <TransTopup />
        }
      ]
    },
    {
      path: 'withdraw',
      children: [
        {
          path: 'withdraw',
          element: <TransWithdraw />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-typography',
          element: <UtilsTypography />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-color',
          element: <UtilsColor />
        }
      ]
    },
    {
      path: 'utils',
      children: [
        {
          path: 'util-shadow',
          element: <UtilsShadow />
        }
      ]
    },
    {
      path: 'icons',
      children: [
        {
          path: 'tabler-icons',
          element: <UtilsTablerIcons />
        }
      ]
    },
    {
      path: 'icons',
      children: [
        {
          path: 'material-icons',
          element: <UtilsMaterialIcons />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    }
  ]
};

export default MainRoutes;
