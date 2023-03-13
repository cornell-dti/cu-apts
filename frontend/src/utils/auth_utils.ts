import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Session } from '../utils/session-store';
import axios from 'axios';
import { getUser, signOut } from '../utils/firebase';

export const setAuthToken = (token: string) => {
  Session.setPersistent({ token: token });
  if (Session.get('token') !== token) {
    console.log('Error saving token to session');
    return false;
  }
  return true;
};

export const getAuthToken = () => {
  const token = Session.get('token');
  if (!token || token === '') {
    return null;
  }
  const exp = JSON.parse(atob(token.split('.')[1])).exp;
  if (token && token !== '' && exp > Math.floor(Date.now() / 1000)) {
    return token;
  } else return null;
};

export function useAuthMandatoryLogin(
  redirectFrom: string
): [boolean, string | null, string, boolean, () => void] {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [netId, setNetId] = useState('');
  const history = useHistory();

  const signOut = () => {
    setToken(null);
    Session.set('token', null);
    history.push('/');
  };

  useEffect(() => {
    const signIn = (redirectFrom: string) => {
      Session.setPersistent({ redirectFrom: redirectFrom });
      history.push('/login');
    };

    const token = getAuthToken();

    if (!token || token === '') {
      signIn(redirectFrom);
    }

    axios
      .post('/v2/getStudentEmailByToken', {
        token: token,
      })
      .then((response) => {
        const res = response.data.result;
        var verifiedEmail = '';

        if (res.code === 200) {
          console.log(res.message);
          verifiedEmail = res.message;
        }

        setNetId(verifiedEmail.substring(0, verifiedEmail.lastIndexOf('@')));
      })
      .catch((e) => console.log(e.response));

    setToken(token);
    setIsAuthenticating(false);
    setIsLoggedIn(true);
  }, [redirectFrom, history]);

  return [isLoggedIn, token, netId, isAuthenticating, signOut];
}

export function useAuthOptionalLogin(): [
  boolean,
  string | null,
  string,
  (redirectFrom: string) => void,
  (redirectTo?: string) => void
] {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState(null);
  const [netId, setNetId] = useState('');

  const history = useHistory();

  useEffect(() => {
    const token = getAuthToken();

    if (token && token !== '') {
      setToken(token);
      setIsLoggedIn(true);
    }

    axios
      .post('/v2/getStudentEmailByToken', {
        token: token,
      })
      .then((response) => {
        const res = response.data.result;
        var verifiedEmail = '';

        if (res.code === 200) {
          console.log(res.message);
          verifiedEmail = res.message;
        }

        setNetId(verifiedEmail.substring(0, verifiedEmail.lastIndexOf('@')));
      })
      .catch((e) => console.log(e.response));
  }, []);

  const signIn = (redirectFrom: string) => {
    Session.setPersistent({ redirectFrom: redirectFrom });
    getUser();
  };

  const signOut = (redirectTo?: string) => {
    setIsLoggedIn(false);
    setToken(null);
    Session.set('token', null);
    if (redirectTo) {
      history.push(redirectTo);
    } else {
      window.location.reload();
    }
  };

  return [isLoggedIn, token, netId, signIn, signOut];
}
