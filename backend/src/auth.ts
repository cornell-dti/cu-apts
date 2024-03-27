import { RequestHandler } from 'express';
import { auth } from './firebase-config';

/**
 * Middleware to authenticate API requests.
 * Requires the authorization header to be passed as input to the api request.
 * Ex: await axios.put(endpoint, {}, createAuthHeaders(token));
 * @returns status 401 if the token is invalid, not present, syntax is invalid, domain is invalid,
 *          or calls next if the token is valid
 */
const authenticate: RequestHandler = async (req, res, next) => {
  try {
    const { authorization } = req.headers; // Extract the authorization header from the request

    // Check if the authorization header is present
    if (!authorization) {
      res.status(401).send({ error: 'Header not found' });
      return;
    }

    // Split the authorization header into 'Bearer' and the token
    const [bearer, token] = authorization.split(' ');

    // Check if the token syntax is correct (Bearer token)
    if (bearer !== 'Bearer') {
      res.status(401).send({ error: 'Invalid token syntax' });
      return;
    }

    // Verify the token using Firebase auth
    const user = await auth.verifyIdToken(token);

    // Check if the email domain is 'cornell.edu' (specific to this application's requirements)
    if (!user.email?.endsWith('@cornell.edu')) {
      res.status(401).send({ error: 'Invalid domain' });
      return;
    }

    // Attach the user object to the request and call next middleware
    req.user = user;
    next();
  } catch (e) {
    // Handle any errors during authentication
    res.status(401).send({ error: 'Authentication Error' });
  }
};

// Export the authenticate middleware
export default authenticate;
