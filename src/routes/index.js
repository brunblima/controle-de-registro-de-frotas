import AuthRoutes from './auth.route';
import AppRoutes from './app.routes';
import {useAuth} from '../context/AuthContext';

function Routes() {
  const {signed} = useAuth();

  return !signed ? <AuthRoutes /> : <AppRoutes />;
}

export default Routes;
