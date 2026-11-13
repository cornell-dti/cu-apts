import firebase from 'firebase/app';
import { AxiosRequestConfig } from 'axios';
import { Likes } from '../../../common/types/db-types';
import { v4 as uuid } from 'uuid';

import 'firebase/auth'; // for authentication
import 'firebase/storage'; // for storage
import 'firebase/database'; // for realtime database
import 'firebase/firestore'; // for cloud firestore

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
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
  const fileUrl = file.name;

  // Check if the file URL is already from the cloud, if so, return it
  if (fileUrl.startsWith('https://')) {
    return fileUrl;
  }

  const result = await storageRef.child(uuid()).put(file);
  return await result.ref.getDownloadURL();
};

const uploadBlogCoverAndSave = async (postId: string, file: File) => {
  const storageRef = storage.ref();
  const fileRef = storageRef.child(`blogcovers/${postId}/cover_${Date.now()}_${file.name}`);

  await fileRef.put(file);
  const url = await fileRef.getDownloadURL();

  await firestore.collection('blogposts').doc(postId).update({
    coverImageUrl: url,
  });

  return url;
};

/**
 * onUserChange – Calls back once Firebase restores the signed-in session, and again on every sign
 * in or sign out.
 *
 * @param {(user: firebase.User | null) => void} callback – Gets the user, or null if signed out.
 * @returns {firebase.Unsubscribe} – Call it to stop listening.
 */
const onUserChange = (callback: (user: firebase.User | null) => void): firebase.Unsubscribe =>
  auth.onAuthStateChanged(callback);

/**
 * subscribeToFolder – Listens for changes to a folder, so everyone in a shared folder sees
 * updates (like a roommate adding a listing) right away.
 *
 * @remarks
 * Reads the folder straight from Firestore, which firestore.rules only allows for the folder's
 * owner and members. If reading isn't allowed, `onDenied` is called with whether the listener had
 * already received the folder: true means the user just lost access (they were removed or the
 * folder was deleted), and false means live updates aren't available for them.
 *
 * @param {string} folderId – The folder to listen to.
 * @param {() => void} onChange – Called each time the folder changes after the first load.
 * @param {(hadAccess: boolean) => void} onDenied – Called if Firestore stops allowing the reads.
 * @returns {() => void} – Call it to stop listening.
 */
const subscribeToFolder = (
  folderId: string,
  onChange: () => void,
  onDenied: (hadAccess: boolean) => void
): (() => void) => {
  let hasLoaded = false;
  return firestore
    .collection('folders')
    .doc(folderId)
    .onSnapshot(
      () => {
        // The first snapshot is the folder as it is now, which the page already loaded
        if (hasLoaded) onChange();
        hasLoaded = true;
      },
      (error) => {
        const { code } = error as firebase.firestore.FirestoreError;
        if (code === 'permission-denied') onDenied(hasLoaded);
        else console.error('Error listening to folder:', error);
      }
    );
};

export {
  subscribeToFolder,
  uploadBlogCoverAndSave,
  createAuthHeaders,
  getUser,
  uploadFile,
  subscribeLikes,
  signOut,
  onUserChange,
};
