import { RequestHandler } from 'express';
import { auth } from './firebase-config';

const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization) {
      res.status(401).send({ error: 'Header not found' });
      return;
    }
    const [bearer, token] = authorization.split(' ');
    if (bearer !== 'Bearer') {
      res.status(401).send({ error: 'Invalid token syntax' });
      return;
    }
    const user = await auth.verifyIdToken(token);
    if (!user.email?.endsWith('@cornell.edu')) {
      res.status(401).send({ error: 'Invalid domain' });
      return;
    }

    req.user = user;
    next();
  } catch (e) {
    res.status(401).send({ error: 'Authentication Error' });
  }
};

export default authenticate;
