
import { decodeSession } from '../lib/users';
import User from '../models/User';

export const fetchSession = async (res, req, next) => {
  let authorizationHeader = res.headers.authorization;
  if (!authorizationHeader) return next();
  authorizationHeader = authorizationHeader.split(' ');
  if (authorizationHeader.length != 2) throw new Error('Invalid Authorization Token');
  const userId = decodeSession(authorizationHeader[1]);
  if (userId) {
    res.user = await User.findById(userId);
  }
  return next();
};

export const requireUser = (role = null) => (res, req, next) => {
  if (!res.user) { return next(new Error('Could not authenticate user')); }
  if (role && res.user.role !== role) { return next(new Error('Could not authenticate user (invalid permissions)')); }
  return next();
};
