import firebase from 'firebase';
import { config } from 'dotenv';
import { AxiosRequestConfig } from 'axios';
import { v4 as uuid } from 'uuid';

config();

const firebaseConfig = {
  apiKey: 'AIzaSyCJulo-7tVPqEEsTTRjEsUzSRw8-RCLDVw',
  authDomain: 'cuapts-68201.firebaseapp.com',
  storageBucket: 'cuapts-68201.appspot.com',
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();

const storage = firebase.storage();

const provider = new firebase.auth.GoogleAuthProvider();

const getUser = async () => {
  if (!auth.currentUser) {
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

const uploadFile = async (file: File) => {
  const storageRef = storage.ref();
  const result = await storageRef.child(uuid()).put(file);
  return await result.ref.getDownloadURL();
};

export { createAuthHeaders, getUser, uploadFile };
