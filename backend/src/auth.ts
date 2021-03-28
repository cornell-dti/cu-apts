import { RequestHandler } from 'express';
import { auth } from './firebase';

const authenticate: RequestHandler = async (req, res, next) => {
  const header = req.get('Authentication');
  if (header) {
    const [authType, authToken] = header.split(' ');
    if (authType === 'Bearer') {
      req.user = await auth.verifyIdToken(authToken);
    }
  }
  next();
};

export default authenticate;
