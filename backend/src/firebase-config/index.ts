import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

const serviceAccountPath = './resources/firebase-adminsdk.json';

const hydrateServiceAccount = (serviceAccountPath: string): admin.ServiceAccount => {
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath).toString());
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  return { ...serviceAccount, privateKey };
};

admin.initializeApp({
  credential: admin.credential.cert(hydrateServiceAccount(serviceAccountPath)),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();
const auth = admin.auth();

const { FieldValue } = admin.firestore;

export { db, auth, FieldValue };
