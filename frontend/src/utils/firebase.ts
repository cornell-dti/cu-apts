import firebase from 'firebase';
import { config } from 'dotenv';
import { AxiosRequestConfig } from 'axios';
import { Likes } from '../../../common/types/db-types';
import { v4 as uuid } from 'uuid';

config();

const firebaseConfig = {
  apiKey: 'AIzaSyCJulo-7tVPqEEsTTRjEsUzSRw8-RCLDVw',
  authDomain: 'cuapts-68201.firebaseapp.com',
  projectId: 'cuapts-68201',
  storageBucket: 'cuapts-68201.appspot.com',
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
    console.log(data);
    if (!data) return;
    callback(data);
  });
};

const uploadFile = async (file: File) => {
  const storageRef = storage.ref();
  const result = await storageRef.child(uuid()).put(file);
  return await result.ref.getDownloadURL();
};

export { createAuthHeaders, getUser, uploadFile, subscribeLikes };
