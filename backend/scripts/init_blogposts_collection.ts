/**
 * init_blogposts_collection.ts
 *
 * One-time idempotent script to ensure the `blogposts` Firestore collection exists
 * with the correct schema. Creates a sentinel document if the collection is empty.
 *
 * Safe to run multiple times — never overwrites existing documents.
 *
 * Usage: ts-node scripts/init_blogposts_collection.ts
 */

import { db } from '../src/firebase-config';

const blogPostCollection = db.collection('blogposts');

const initBlogPostsCollection = async (): Promise<void> => {
  console.log('Checking blogposts collection...');

  const snapshot = await blogPostCollection.limit(1).get();

  if (!snapshot.empty) {
    console.log(`Collection already has ${snapshot.size}+ document(s). No initialization needed.`);
    return;
  }

  console.log('Collection is empty. Creating sentinel document...');

  const sentinelDoc = blogPostCollection.doc('_init');
  const existing = await sentinelDoc.get();

  if (existing.exists) {
    console.log('Sentinel document already exists. Done.');
    return;
  }

  await sentinelDoc.set({
    title: '[INIT] Collection initialized',
    content: '',
    blurb: '',
    date: new Date(),
    tags: [],
    visibility: 'DELETED',
    likes: 0,
    saves: 0,
    coverImageUrl: '',
    userId: null,
  });

  console.log('Sentinel document created at blogposts/_init with visibility=DELETED.');
  console.log('Collection is ready. This sentinel document is safe to delete.');
};

initBlogPostsCollection()
  .then(() => {
    console.log('Done.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error initializing blogposts collection:', err);
    process.exit(1);
  });
