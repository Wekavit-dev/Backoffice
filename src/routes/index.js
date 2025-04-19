import { useRoutes } from 'react-router-dom';
// routes
import MainRoutes from './MainRoutes';
import { AuthenticationRoutes } from './AuthenticationRoutes';
import AuthLoginRoute from './LoginRoutes';

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return useRoutes([AuthenticationRoutes, MainRoutes, AuthLoginRoute]);
}
