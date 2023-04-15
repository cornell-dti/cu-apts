import firebase from 'firebase/app';
import { config } from 'dotenv';
import { AxiosRequestConfig } from 'axios';
import { Likes } from '../../../common/types/db-types';
import { v4 as uuid } from 'uuid';

import 'firebase/auth'; // for authentication
import 'firebase/storage'; // for storage
import 'firebase/database'; // for realtime database
import 'firebase/firestore'; // for cloud firestore

config();

const firebaseConfig = {
  apiKey: 'AIzaSyAdMQ6iXx24ekH8UU-JIJHbTK99vkNQQ9s',
  authDomain: 'cuapts-prod.firebaseapp.com',
  projectId: 'cuapts-prod',
  storageBucket: 'cuapts-prod.appspot.com',
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const firestore = firebase.firestore();
const storage = firebase.storage();

const provider = new firebase.auth.GoogleAuthProvider();
provider.setCustomParameters({
  prompt: 'select_account',
});

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

const signOut = async () => {
  await auth.signOut();
};

const createAuthHeaders = (token: string): AxiosRequestConfig => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const subscribeLikes = (callback: (data: Likes) => void) => {
  return auth.onAuthStateChanged(async (user) => {
    if (!user) return;
    const doc = await firestore.collection('likes').doc(user.uid).get();
    const data = doc.data();
    if (!data) return;
    callback(data);
  });
};

const uploadFile = async (file: File) => {
  const storageRef = storage.ref();
  const result = await storageRef.child(uuid()).put(file);
  return await result.ref.getDownloadURL();
};

export { createAuthHeaders, getUser, uploadFile, subscribeLikes, signOut };
