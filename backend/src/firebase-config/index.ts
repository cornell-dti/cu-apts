import * as admin from 'firebase-admin';
import { config } from 'dotenv';

config();

const hydrateServiceAccount = (): admin.ServiceAccount => {
  const privateKey = process.env.REACT_APP_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.REACT_APP_PROJECT_ID;
  const clientEmail = process.env.REACT_APP_CLIENT_EMAIL;
  return { projectId, clientEmail, privateKey };
};

admin.initializeApp({
  credential: admin.credential.cert(hydrateServiceAccount()),
  databaseURL: process.env.REACT_APP_DATABASE_URL,
});

const db = admin.firestore();
const auth = admin.auth();

const { FieldValue } = admin.firestore;

export { db, auth, FieldValue };
