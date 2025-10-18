import { useSelector, useDispatch } from 'react-redux';
import { login as loginAction, logout as logoutAction } from '../redux/features/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, authToken, userId } = useSelector((state) => state.auth);

  const login = (authData) => {
    dispatch(loginAction(authData));
  };

  const logout = () => {
    dispatch(logoutAction());
  };

  return {
    user,
    authToken,
    userId,
    login,
    logout,
    isAuthenticated: !!authToken,
  };
};
