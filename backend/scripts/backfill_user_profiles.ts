/**
 * backfill_user_profiles.ts
 *
 * One-time script that saves a searchable profile (NetID, name, and email) for everyone who
 * signed in to CU Apts before profiles existed, so the folder invite box can suggest them. New
 * sign-ins save their own profile through POST /api/users/profile.
 *
 * Safe to run more than once: it merges into each person's `users` document, so their saved
 * apartments are kept. Accounts without a Cornell email are skipped.
 *
 * Usage (from the backend folder): yarn backfill_user_profiles
 */

import { auth, db } from '../src/firebase-config';
import { buildUserProfile } from '../src/userDirectory';

const usersCollection = db.collection('users');

// Firestore allows at most 500 writes in one batch, so read accounts 500 at a time
const PAGE_SIZE = 500;

const backfillUserProfiles = async (): Promise<void> => {
  let pageToken: string | undefined;
  let saved = 0;
  let skipped = 0;

  do {
    // eslint-disable-next-line no-await-in-loop
    const page = await auth.listUsers(PAGE_SIZE, pageToken);
    const profiles = page.users.map((user) => ({
      uid: user.uid,
      profile: buildUserProfile(user.email ?? '', user.displayName),
    }));
    const batch = db.batch();
    profiles.forEach(({ uid, profile }) => {
      if (profile) batch.set(usersCollection.doc(uid), profile, { merge: true });
    });
    const savedOnPage = profiles.filter(({ profile }) => profile !== null).length;
    saved += savedOnPage;
    skipped += profiles.length - savedOnPage;
    // eslint-disable-next-line no-await-in-loop
    await batch.commit();
    pageToken = page.pageToken;
  } while (pageToken);

  console.log(`Saved ${saved} profiles. Skipped ${skipped} accounts without a Cornell email.`);
};

backfillUserProfiles()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error backfilling user profiles:', err);
    process.exit(1);
  });
