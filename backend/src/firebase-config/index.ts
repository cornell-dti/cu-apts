import * as admin from 'firebase-admin';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env.dev') });

const hydrateServiceAccount = (): admin.ServiceAccount => {
  const privateKey = process.env.REACT_APP_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.REACT_APP_PROJECT_ID;
  const clientEmail = process.env.REACT_APP_CLIENT_EMAIL;
  return { projectId, clientEmail, privateKey };
};

// Only initialize if we have the required credentials
const serviceAccount = hydrateServiceAccount();
if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.REACT_APP_DATABASE_URL,
  });
} else {
  console.error('Missing required Firebase credentials. Cannot initialize Firebase.');
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();
const { FieldValue, FieldPath } = admin.firestore;

export { db, auth, FieldValue, FieldPath };
