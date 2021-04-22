import firebase from 'firebase';
import { config } from 'dotenv';
import { AxiosRequestConfig } from 'axios';
import { Likes } from '../../../common/types/db-types';

config();

const firebaseConfig = {
  apiKey: 'AIzaSyCJulo-7tVPqEEsTTRjEsUzSRw8-RCLDVw',
  authDomain: 'cuapts-68201.firebaseapp.com',
  projectId: 'cuapts-68201',
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const firestore = firebase.firestore();

const provider = new firebase.auth.GoogleAuthProvider();

const getUser = async (promptSignIn = false) => {
  if (!auth.currentUser && promptSignIn) {
    await auth.signInWithPopup(provider);
  }
  const user = auth.currentUser;
  if (user?.email?.endsWith('@cornell.edu')) {
    return user;
  }
  await auth.signOut();
  return null;
};

const createAuthHeaders = (token: string): AxiosRequestConfig => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const subscribeLikes = (setState: (data: Likes) => void) => {
  return auth.onAuthStateChanged(async (user) => {
    if (!user) return;
    const doc = await firestore.collection('likes').doc(user.uid).get();
    const data = doc.data();
    if (!data) return;
    setState(data);
  });
};

export { createAuthHeaders, getUser, subscribeLikes };
