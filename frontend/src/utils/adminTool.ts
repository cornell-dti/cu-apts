import { admins } from '../constants/HomeConsts';
export const isAdmin = (user: firebase.User | null) => {
  if (user && typeof user?.email === 'string' && admins.includes(user?.email)) return true;
  return false;
};
