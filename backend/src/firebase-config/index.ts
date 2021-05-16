import * as admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { config } from 'dotenv';

config();

admin.initializeApp({
  credential: admin.credential.cert(
    JSON.parse(readFileSync('./firebase-adminsdk.json').toString())
  ),
  databaseURL: process.env.DATABASE_URL,
});

const db = admin.firestore();
const auth = admin.auth();

const { FieldValue } = admin.firestore;

export { db, auth, FieldValue };
